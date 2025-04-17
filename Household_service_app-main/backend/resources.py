from flask_restful import Resource, fields, marshal_with
from flask_security import auth_required, hash_password,current_user
from backend.models import Customer, Professional, Service, Service_Request, User_Info, db
from flask import request,current_app as app
from flask_restful import Api
from sqlalchemy import func

from datetime import datetime



api = Api(prefix='/api')
cache=app.cache

user_fields = {
    'email': fields.String,
    'active': fields.Boolean,
}

customer_fields = {
    'cust_id': fields.Integer,
    'email': fields.String,
    'name': fields.String,
    'address': fields.String,
    'pincode': fields.Integer,
    'phone': fields.String,
    'active': fields.Boolean,
}

professional_fields = {
    'prof_id': fields.Integer,
    'email': fields.String,
    'name': fields.String,
    'address': fields.String,
    'pincode': fields.Integer,
    'service_name': fields.String,
    'experience': fields.Integer,
    'phone': fields.String,
    'rating': fields.Float,
    'verified': fields.Boolean,
    'active': fields.Boolean,
}

service_fields = {
    'service_id': fields.Integer,
    'service_name': fields.String,
    'base_price': fields.Integer,
}

service_request_fields = {
    'request_id': fields.Integer,
    'customer_email': fields.String,
    'offered_price': fields.Integer,
    'professional_email': fields.String,
    'service_id': fields.Integer,
    'requested_date': fields.DateTime,
    'closed_date':fields.DateTime,
    'rating': fields.Integer,
    'status': fields.String,
    'service_name': fields.String,
    'base_price':fields.Integer,
    'customer_name': fields.String,
    'professional_name': fields.String,
    'customer_phone': fields.Integer,
    'professional_phone': fields.Integer,
    'customer_address': fields.String,
    'professional_address': fields.String,
    'customer_pincode': fields.Integer,
    'professional_pincode': fields.Integer,
    'customer_active': fields.Boolean,
    'professional_active': fields.Boolean,
    'professional_exp':fields.Integer,
}




class UserApi(Resource):
    @marshal_with(user_fields)
    # @auth_required('token')
    def get(self):  
        try:
            print("Fetching user info")
            email = current_user.email
            print(email)
            user = User_Info.query.filter_by(email=email).first()
            if not user:
                return {"message": "User not found"}, 404
            return user
        except Exception as e:
            return {"message": str(e)}, 500


class CustomerApi(Resource):
    @marshal_with(customer_fields)
    @auth_required('token')
    @cache.memoize(timeout=5)
    def get(self, cust_id=None):
        try:
            if cust_id is None:
                customers = Customer.query.all()
            else:
                customers = [Customer.query.get(cust_id)]
            if not customers:
                return {"message": "Customer not found"}, 404
            result = []
            for cust in customers:
                user = User_Info.query.filter_by(email=cust.email).first()
                cust_dict = cust.__dict__.copy()
                cust_dict['active'] = user.active if user else False  
                result.append(cust_dict)
            
            return result if cust_id is None else result[0]
        except Exception as e:
            return {"message": str(e)}, 500

    def post(self):
        try:
            data = request.get_json()
            email = data.get('email')
            password = data.get('password')  
            name = data.get('name')
            address = data.get('address')
            pincode = data.get('pincode')
            phone = data.get('phone')
            existing_user = User_Info.query.filter_by(email=email).first()
            if existing_user:
                return {"message": "User already exists either as customer or professional. Try with a different email"}, 400
            
            user_info = User_Info(email=email, password=hash_password(password), active=True)
            db.session.add(user_info)

           
            cust = Customer(email=email, name=name, address=address, pincode=pincode, phone=phone)
            db.session.add(cust)

            db.session.commit()
            return {"message": "Customer created"}, 201
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 500
        
    @auth_required('token')     
    def put(self, cust_id): 
        try:
            data = request.get_json()
            cust = Customer.query.get(cust_id)
            user = User_Info.query.filter_by(email=cust.email).first()
            if not cust:
                return {"message": "Customer not found"}, 404
            cust.name = data.get('name', cust.name)
            cust.address = data.get('address', cust.address)
            cust.pincode = data.get('pincode', cust.pincode)
            cust.phone = data.get('phone', cust.phone)
            user.active = data.get('active', user.active)
            db.session.commit()
            return {"message": "Customer updated"}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 500

    @auth_required('token')
    def delete(self, cust_id):
        try:
            cust = Customer.query.get(cust_id)
            if not cust:
                return {"message": "Customer not found"}, 404
            user = User_Info.query.filter_by(email=cust.email).first()
            db.session.delete(cust)
            if user:
                db.session.delete(user)
            db.session.commit()
            return {"message": "Customer deleted"}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 500


class ProfessionalApi(Resource):
    @marshal_with(professional_fields)
    @auth_required('token')
    @cache.memoize(timeout=5)
    def get(self, prof_id=None):
        try:
            if prof_id is None:
                professionals = Professional.query.all()
            else:
                professionals = [Professional.query.get(prof_id)]
            if not professionals:
                return {"message": "Professional not found"}, 404
            result = []
            for prof in professionals:
                user = User_Info.query.filter_by(email=prof.email).first()
                prof_dict = prof.__dict__.copy()
                prof_dict['active'] = user.active if user else False  
                result.append(prof_dict)
            
            return result
            
        except Exception as e:
            return {"message": str(e)}, 500

    def post(self):
        try:
            data = request.get_json()
            email = data.get('email')
            name = data.get('name')
            password = data.get('password')
            address = data.get('address')
            pincode = data.get('pincode')
            service_name = data.get('service_name')
            experience = data.get('experience')
            phone = data.get('phone')
            
            existing_service = Service.query.filter(func.lower(Service.service_name) == service_name.lower()).first()
            if existing_service:
                existing_user = User_Info.query.filter_by(email=email).first()
                if existing_user:
                    return {"message": "User already exists either as customer or professional. Try with a different email"}, 400
                user_info = User_Info(email=email, password=hash_password(password), active=False)
                db.session.add(user_info)
                prof = Professional(
                    email=email, name=name, address=address, 
                    pincode=pincode, service_name=service_name, 
                    experience=experience, phone=phone, verified=False
                )
                db.session.add(prof)

                db.session.commit()
                return {"message": "Professional created"}, 201
            else:
                return {"message": "You can't register for this service, mail the admin for creating this service"}, 404

        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 500

    @auth_required('token')
    def put(self, prof_id):
        try:
            data = request.get_json()
            prof = Professional.query.get(prof_id)
            user = User_Info.query.filter_by(email=prof.email).first()
            if not prof:
                return {"message": "Professional not found"}, 404
            prof.verified = data.get('verified', prof.verified)
            user.active = data.get('active', user.active)
            db.session.commit()
            return {"message": "Professional updated"}, 200
        except Exception as e:      
            db.session.rollback()
            return {"message": str(e)}, 500 

    @auth_required('token')
    def delete(self, prof_id):
        try:
            prof = Professional.query.get(prof_id)
            user = User_Info.query.filter_by(email=prof.email).first()
            if not prof:
                return {"message": "Professional not found"}, 404
            db.session.delete(user)
            db.session.delete(prof)
            db.session.commit()
            return {"message": "Professional deleted"}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 500


class ServiceApi(Resource):
    @marshal_with(service_fields)
    # @auth_required('token')
    @cache.memoize(timeout=5)
    def get(self, service_id=None):
        try:
            if service_id is None:      
                services = Service.query.all()
                return services
            else:
                service = Service.query.get(service_id)
                if not service:
                    return {"message": "Service not found"}, 404
                return service
        except Exception as e:
            return {"message": str(e)}, 500

    @auth_required('token')
    def post(self):
        try:
            data = request.get_json()
            service_name = data.get('service_name')
            base_price = data.get('base_price')
            existing_service = Service.query.filter(func.lower(Service.service_name) == service_name.lower()).first()
            if existing_service:
                return {"message": "Service already exists"}, 400
                
            service = Service(service_name=service_name, base_price=base_price)
            db.session.add(service)
            db.session.commit()
            return {"message": "Service created"}, 201
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 500
        
    @auth_required('token')
    def put(self, service_id):
        try:
            data = request.get_json()
            service = Service.query.get(service_id)
            if not service:
                return {"message": "Service not found"}, 404
            service.service_name = data.get('service_name', service.service_name)
            service.base_price = data.get('base_price', service.base_price)
            db.session.commit()
            return {"message": "Service updated"}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 500

    @auth_required('token')
    def delete(self, service_id):
        try:
            service = Service.query.get(service_id)
            if not service:
                return {"message": "Service not found"}, 404
            db.session.delete(service)
            db.session.commit()
            return {"message": "Service deleted"}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 500


class ServiceRequestApi(Resource):
    @marshal_with(service_request_fields)
    @auth_required('token')
    @cache.memoize(timeout=5)
    def get(self, request_id=None):
        try:
            email = current_user.email
            role = current_user.roles[0].name
            print(f"User role: {role}, User email: {email}")

            result = []
            if request_id is None:
                if role == 'professional':
                    prof=Professional.query.filter_by(email=email).first()
                    service=Service.query.filter_by(service_name=prof.service_name).first()
                    service_id=service.service_id
                    print(service_id)
                    service_requests = Service_Request.query.filter(
                        (Service_Request.professional_email == email) | 
                        (Service_Request.professional_email == 'No'),
                        (Service_Request.service_id == service_id) 
                        
                    ).all()
                    for service_request in service_requests:
                        service = Service.query.get(service_request.service_id)
                        cust = Customer.query.filter_by(email=service_request.customer_email).first()
                        user = User_Info.query.filter_by(email=service_request.customer_email).first()
                        # if not cust:
                        #     print(f"Customer not found for email: {service_request.customer_email}")
                        #     continue
                        request_dict = service_request.__dict__.copy()
                        request_dict['service_name'] = service.service_name if service else None
                        request_dict['base_price'] = service.base_price if service else None
                        request_dict['customer_name'] = cust.name if cust else None
                        # print(f"Customer name: {cust.name}")
                        request_dict['customer_phone'] = cust.phone if cust else None
                        request_dict['customer_address'] = cust.address if cust else None
                        request_dict['customer_pincode'] = cust.pincode if cust else None
                        request_dict['customer_active'] = user.active if user else False
                        result.append(request_dict)
                elif role == 'customer':
                    service_requests = Service_Request.query.filter_by(customer_email=email).all()
                    for service_request in service_requests:
                        service = Service.query.get(service_request.service_id)
                        prof = Professional.query.filter_by(email=service_request.professional_email).first()
                        user = User_Info.query.filter_by(email=service_request.professional_email).first()
                        request_dict = service_request.__dict__.copy()
                        request_dict['service_name'] = service.service_name if service else None
                        request_dict['base_price'] = service.base_price if service else None
                        request_dict['professional_name'] = prof.name if prof else None
                        request_dict['professional_exp']=prof.experience if prof else None
                        request_dict['professional_phone'] = prof.phone if prof else None
                        request_dict['professional_address'] = prof.address if prof else None
                        request_dict['professional_pincode'] = prof.pincode if prof else None
                        request_dict['professional_active'] = user.active if user else False
                        result.append(request_dict)
                else:
                    service_requests = Service_Request.query.all()
                    for service_request in service_requests:
                        service = Service.query.get(service_request.service_id)
                        request_dict = service_request.__dict__.copy()
                        request_dict['service_name'] = service.service_name if service else None
                        request_dict['base_price'] = service.base_price if service else None
                        result.append(request_dict)
                return result
            else:
                if role == 'professional':
                    prof=Professional.query.filter_by(email=email).first()
                    service=Service.query.filter_by(service_name=prof.service_name).first()
                    service_id=service.service_id
                    print(service_id)
                    service_requests = Service_Request.query.filter(
                        (Service_Request.professional_email == email) | 
                        (Service_Request.professional_email == 'No'),
                        (Service_Request.service_id == service_id) 
                        
                    ).first()
                    if service_request:
                        service = Service.query.get(service_request.service_id)
                        cust = Customer.query.filter_by(email=service_request.customer_email).first()
                        user = User_Info.query.filter_by(email=service_request.customer_email).first()
                        request_dict = service_request.__dict__.copy()
                        request_dict['service_name'] = service.service_name if service else None
                        request_dict['customer_name'] = cust.name if cust else None
                        request_dict['customer_phone'] = cust.phone if cust else None
                        request_dict['base_price'] = service.base_price if service else None
                        request_dict['customer_address'] = cust.address if cust else None
                        request_dict['customer_pincode'] = cust.pincode if cust else None
                        request_dict['customer_active'] = user.active if user else False
                elif role == 'customer':
                    service_request = Service_Request.query.filter_by(customer_email=email, request_id=request_id).first()
                    # print(service_request)
                    if service_request:
                        service = Service.query.get(service_request.service_id)
                        prof = Professional.query.filter_by(email=service_request.professional_email).first()
                        user = User_Info.query.filter_by(email=service_request.professional_email).first()
                        request_dict = service_request.__dict__.copy()
                        request_dict['service_name'] = service.service_name if service else None
                        request_dict['professional_name'] = prof.name if prof else None
                        request_dict['professional_exp']=prof.experience if prof else None
                        request_dict['base_price'] = service.base_price if service else None
                        request_dict['professional_phone'] = prof.phone if prof else None
                        request_dict['professional_address'] = prof.address if prof else None
                        request_dict['professional_pincode'] = prof.pincode if prof else None
                        request_dict['professional_active'] = user.active if user else False
                else:
                    service_request = Service_Request.query.get(request_id)
                    if service_request:
                        service = Service.query.get(service_request.service_id)
                        request_dict = service_request.__dict__.copy()
                        request_dict['service_name'] = service.service_name if service else None
                        request_dict['base_price'] = service.base_price if service else None
                
                if not service_request:
                    return {"message": "Service request not found"}, 404
                
                return request_dict
        except Exception as e:
            print(f"Error: {str(e)}")  
            return {"message": str(e)}, 500

    @auth_required('token')
    def post(self):
        try:
            role=current_user.roles[0].name
            if role == 'customer':
                data = request.get_json()
                customer_email = data.get('customer_email')
                offered_price = data.get('offered_price')
                professional_email = data.get('professional_email')
                if professional_email is None:
                    professional_email = "No"
                service_id = data.get('service_id')
                requested_date = datetime.now()
                existing_request = Service_Request.query.filter_by(service_id=service_id, professional_email=professional_email,customer_email=customer_email).first()
                if existing_request and existing_request.offered_price == offered_price and existing_request.status!='closed':
                    return {"message": "A request for this service with the same offered price already exists"}, 400
                service_request = Service_Request(customer_email=customer_email, offered_price=offered_price, professional_email=professional_email, service_id=service_id, requested_date=requested_date)
                db.session.add(service_request)
                db.session.commit()
                return {"message": "Service request created"}, 201
            return {"message": f"{current_user.email} is not a customer"}, 403
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 500
        
    @auth_required('token')
    def put(self, request_id):
        try:
            role = current_user.roles[0].name
            data = request.get_json()
            service_request = Service_Request.query.get(request_id)
            prof=Professional.query.filter_by(email=service_request.professional_email).first()
            if not service_request:
                return {"message": "Service request not found"}, 404
            service=Service.query.get(service_request.service_id)
            service_request.customer_email = data.get('customer_email', service_request.customer_email)
            service_request.offered_price = data.get('offered_price', service_request.offered_price)
            service_request.closed_date=datetime.now()
            service_request.professional_email = data.get('professional_email', service_request.professional_email)
            service_request.service_id = data.get('service_id', service_request.service_id)
            service_request.requested_date = data.get('requested_date', service_request.requested_date)
            service_request.rating = data.get('rating', service_request.rating)
            service_request.status = data.get('status', service_request.status)
            if prof:
                rating_sum = db.session.query(func.sum(Service_Request.rating)) \
                    .filter(Service_Request.professional_email == prof.email, Service_Request.status == "closed", Service_Request.rating > 0) \
                    .scalar() or 0  # Handle None case

                rating_count = db.session.query(func.count(Service_Request.request_id)) \
                    .filter(Service_Request.professional_email == prof.email, Service_Request.status == "closed") \
                    .scalar() or 0  # Handle None case

                if rating_count > 0:
                    prof.rating = rating_sum / rating_count 
                    
            db.session.commit()
            return {"message": "Service request updated"}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 500

    @auth_required('token')
    def delete(self, request_id):
        try:
            service_request = Service_Request.query.get(request_id)
            if not service_request:
                return {"message": "Service request not found"}, 404
            db.session.delete(service_request)
            db.session.commit()
            return {"message": "Service request deleted"}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 500
        

        
        

       




api.add_resource(UserApi, '/user')
api.add_resource(CustomerApi, '/customer', '/customer/<int:cust_id>')
api.add_resource(ProfessionalApi, '/professional', '/professional/<int:prof_id>')
api.add_resource(ServiceApi, '/service', '/service/<int:service_id>')
api.add_resource(ServiceRequestApi, '/service_request', '/service_request/<int:request_id>')
# api.add_resource(AdminSearchApi,'/search_user')