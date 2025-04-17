from celery import shared_task
import time
from datetime import datetime, timedelta
import flask_excel
from backend.models import *
from backend.celery.mail_service import send_email

@shared_task(bind=True, ignore_result=False)
def create_csv(self):
    task_id = self.request.id
    filename = f'request{task_id}.csv'

    
    closed_requests = Service_Request.query.filter_by(status='closed').all()

   
    column_names = [
        "Request ID",
        "Customer Email",
        "Customer Name",
        "Professional Email",
        "Professional Name",
        "service Id",
        "Service Name",
        "Base Price",
        "Offered Price",
        "Requested Date",
        "Closed Date",
        "Rating",
    ]

    data = [column_names]
    if closed_requests:
        for req in closed_requests:
            customer=Customer.query.filter_by(email=req.customer_email).first()
            professional=Professional.query.filter_by(email=req.professional_email).first()
            service=Service.query.filter_by(service_id=req.service_id).first()
            data.append([
                req.request_id,
                customer.email,
                customer.name,
                professional.email,
                professional.name,
                service.service_id,
                service.service_name,
                service.base_price,
                req.offered_price,
                req.requested_date.strftime('%Y-%m-%d %H:%M:%S') if req.requested_date else "N/A",
                req.closed_date.strftime('%Y-%m-%d %H:%M:%S') if req.closed_date else "N/A",
                req.rating if req.rating is not None else "N/A",
            ])

    csv_out = flask_excel.make_response_from_array(data, file_type="csv")

    
    with open(f'./backend/celery/admin_downloads/{filename}', 'wb') as file:
        file.write(csv_out.data)

    return filename


@shared_task(ignore_result=True)
def email_reminder(to, subject, content):
    send_email(to,subject,content)


@shared_task(ignore_result=True)
def send_daily_status():
    
    professionals = Professional.query.filter_by(verified=True).all()

    for prof in professionals:
        user=User_Info.query.filter_by(email=prof.email).first()
        service=Service.query.filter_by(service_name=prof.service_name).first()
        if service and user and user.active:
            pending_requests = Service_Request.query.filter((Service_Request.professional_email == prof.email) | (Service_Request.professional_email == "No"),
            Service_Request.service_id == service.service_id, 
            Service_Request.status == 'pending').count()

            approved_requests = Service_Request.query.filter((Service_Request.professional_email == prof.email) | (Service_Request.professional_email == "No"),
            Service_Request.service_id == service.service_id, 
            Service_Request.status == 'approved').count()

            closed_requests=Service_Request.query.filter((Service_Request.professional_email == prof.email) | (Service_Request.professional_email == "No"),
            Service_Request.service_id == service.service_id, 
            Service_Request.status == 'closed').count()

            subject = "Request Summary"
            body = f"""
            <h2>Hello {prof.name},</h2>
            <p>You have: </p>
            <ul>
                <li><b>Total Pending Requests:</b> {pending_requests}</li>
                <li><b>Total Approved Requests:</b> {approved_requests}, waiting for being closed!</li>
                <li><b>Total Closed Requests:</b> {closed_requests}</li>
            </ul>
            <p>Please check your dashboard for more details.</p>
            <p>Best Regards,<br>Household Service Team</p>
            """

            email_reminder.delay(prof.email, subject, body)
        else:
            pass




@shared_task(ignore_result=True)
def send_monthly_activity_report():
    
    customers = Customer.query.all()
    first_day_of_month = datetime.now().replace(day=1)
    last_month = (first_day_of_month - timedelta(days=1)).replace(day=1)
    
    for customer in customers:
        user = User_Info.query.filter_by(email=customer.email).first()
        if user and user.active:
            pending_requests = Service_Request.query.filter(
                Service_Request.customer_email == customer.email,
                Service_Request.requested_date >= last_month,
                Service_Request.status == 'pending'
            ).all()

            approved_requests = Service_Request.query.filter(
                Service_Request.customer_email == customer.email,
                Service_Request.requested_date >= last_month,
                Service_Request.status == 'approved'
            ).all()

            closed_requests = Service_Request.query.filter(
                Service_Request.customer_email == customer.email,
                Service_Request.closed_date >= last_month,
                Service_Request.status == 'closed'
            ).all()

            subject = "Your Monthly Activity Report"
            html_content = f"""
            <h2>Hello {customer.name},</h2>
            <p>Here is your service request activity report for previous  month:</p>
            <ul>
                <li><b>Total Pending Requests:</b> {len(pending_requests)}</li>
                <li><b>Total Approved Requests:</b> {len(approved_requests)}, waiting for being closed!</li>
                <li><b>Total Closed Requests:</b> {len(closed_requests)}</li>
            </ul>
            """

            if pending_requests:
                html_content += "<h3>Pending Requests</h3><table border='1'><tr><th>Service ID</th><th>Requested Date</th><th>Offered Price</th><th>Professional</th></tr>"
                for req in pending_requests:
                    professional = req.professional_email if req.professional_email != "No" else "Not Assigned"
                    html_content += f"<tr><td>{req.service_id}</td><td>{req.requested_date.strftime('%Y-%m-%d')}</td><td>{req.offered_price}</td><td>{professional}</td></tr>"
                html_content += "</table>"

            if approved_requests:
                html_content += "<h3>Approved Requests</h3><table border='1'><tr><th>Service ID</th><th>Requested Date</th><th>Offered Price</th><th>Professional</th></tr>"
                for req in approved_requests:
                    professional = req.professional_email if req.professional_email != "No" else "Not Assigned"
                    html_content += f"<tr><td>{req.service_id}</td><td>{req.requested_date.strftime('%Y-%m-%d')}</td><td>{req.offered_price}</td><td>{professional}</td></tr>"
                html_content += "</table>"

            if closed_requests:
                html_content += "<h3>Closed Requests</h3><table border='1'><tr><th>Service ID</th><th>Requested Date</th><th>Closed Date</th><th>Offered Price</th><th>Rating</th></tr>"
                for req in closed_requests:
                    rating = req.rating if req.rating else "Not Rated"
                    html_content += f"<tr><td>{req.service_id}</td><td>{req.requested_date.strftime('%Y-%m-%d')}</td><td>{req.closed_date.strftime('%Y-%m-%d')}</td><td>{req.offered_price}</td><td>{rating}</td></tr>"
                html_content += "</table>"

            html_content += "<p>Please check your dashboard for more details.</p><p>Best Regards,<br>Household Service Team</p>"

            email_reminder.delay(customer.email, subject, html_content)


    
