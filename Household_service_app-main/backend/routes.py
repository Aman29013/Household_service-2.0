from flask import jsonify, current_app as app, request, render_template,json,send_file
from flask_security import auth_required, verify_password, hash_password
from backend.models import db
from backend.models import *
from sqlalchemy import func
from datetime import datetime
from backend.celery.tasks import create_csv
from celery.result import AsyncResult
import time

datastore = app.security.datastore
cache=app.cache


@app.get('/')
def hello():
    return render_template('index.html')

@app.get('/cache')
@cache.cached(timeout=5)
def cache():
    return {'time' : str(datetime.now())}



@app.get('/get_celery_data/<id>')
def get_data(id):
    result =AsyncResult(id)
    if result.ready():
        return {'result':result.result},200
    return {'message':'task not ready'},405

@auth_required('token')
@app.get('/create_csv')
def createCSV():
    task=create_csv.delay()
    return {'task_id':task.id},200

@auth_required('token')
@app.get('/get_csv/<id>')
def getCSV(id):
    result=AsyncResult(id)
    if result.ready():
        return send_file(f'./backend/celery/admin_downloads/{result.result}'),200
    return {'message':'csv file is not ready'},405



@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()

    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"message": "invalid inputs"}), 404

    user = datastore.find_user(email=email)
    # print(user.roles)
    if not user:
        return jsonify({"message": "user not exist"}), 404

    if not user.active:
        return jsonify({"message": "user can't login, user is blocked"}), 403

    if verify_password(password, user.password):
        print(user.roles[0].name)
        role = user.roles[0].name
        return jsonify({'token': user.get_auth_token(), 'email': user.email, 'role': role, 'id': user.id})

    return jsonify({"message": "Wrong password"}), 400

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    address = data.get('address')
    pincode = data.get('pincode')
    phone = data.get('phone')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')
    # print()

    if not email or not password or role not in ['customer', 'professional']:
        return jsonify({"message": "invalid inputs"}), 404

    user = datastore.find_user(email=email)
    if user:
        return jsonify({"message": "user already exists either as professional, customer or admin"}), 404


    try:
        if role == 'customer':
            # datastore.find_or_create_role(name='customer')
            if not datastore.find_user(email=email):
                datastore.create_user(email=email, password=hash_password(password), roles=['customer'], active=True)
                # print(user.roles)
                cust = Customer(name=name, email=email, address=address, pincode=pincode, phone=phone)
                db.session.add(cust)
                db.session.commit()
                return jsonify({"message": f"{role} created"}), 200
            else:    
                return jsonify({"message": "User already exists"}), 404
        elif role == 'professional':
            service_name = data.get('service_name')
            experience = data.get('experience')
            existing_service = Service.query.filter(func.lower(Service.service_name) == service_name.lower()).first()
            if not existing_service:
                return jsonify({"message": "Service not found , contact admin"}), 404
            if not datastore.find_user(email=email):
                datastore.create_user(email=email, password=hash_password(password), roles=['professional'], active=False)
                prof = Professional(name=name, email=email, address=address, pincode=pincode, phone=phone, service_name=service_name, experience=experience)
                db.session.add(prof)
                db.session.commit()
                return jsonify({"message": f"{role} created"}), 200
            else:
                return jsonify({"message": "User already exists"}), 404
    except Exception as e:
        db.session.rollback()
        print(f"Error in creating {role}:", str(e)) 
        return jsonify({"message": f"error in creating {role}", "error": str(e)}), 400
    


@app.route('/search_user', methods=['POST'])
@auth_required('token')
def admin_search():
    data = request.get_json()
    # print(data)
   
    role = data.get("role")
    # print(role)
    field = data.get("field")
    # print(field)
    search_query = data.get("query", "").strip()
    print(search_query)

    
    if not role or not field or not search_query:
        return jsonify({"message": "Please provide role, field, and search query."}), 400

    result = []

    if role == "customer":
        users = Customer.query.filter(getattr(Customer, field).ilike(f"%{search_query}%")).all()
        
        if not users:
            return jsonify({"message": "No users found."}), 404
        
        for user in users:
            uinfo = User_Info.query.filter_by(email=user.email).first()
            search_dict = {
                'role': 'customer',
                'cust_id': user.cust_id,
                'cust_email': user.email,
                'cust_name': user.name,
                'cust_address': user.address,
                'cust_pincode': user.pincode,
                'cust_phone': user.phone,
                'cust_active': uinfo.active if uinfo else None,

                'prof_id': None,
                'prof_email': None,
                'prof_name': None,
                'prof_address': None,
                'prof_pincode': None,
                'prof_service_name': None,
                'prof_experience': None,
                'prof_phone': None,
                'prof_rating': None,
                'prof_verified': None,
            }
            result.append(search_dict)

    elif role == "professional":
        users = Professional.query.filter(getattr(Professional, field).ilike(f"%{search_query}%")).all()
        
        if not users:
            return jsonify({"message": "No users found."}), 404

        for user in users:
            uinfo = User_Info.query.filter_by(email=user.email).first()
            search_dict = {
                'role': 'professional',
                'prof_id': user.prof_id,
                'prof_email': user.email,
                'prof_name': user.name,
                'prof_address': user.address,
                'prof_pincode': user.pincode,
                'prof_service_name': user.service_name,
                'prof_experience': user.experience,
                'prof_phone': user.phone,
                'prof_rating': user.rating,
                'prof_verified': user.verified,
                'prof_active': uinfo.active if uinfo else None,

                'cust_id': None,
                'cust_email': None,
                'cust_name': None,
                'cust_address': None,
                'cust_pincode': None,
                'cust_phone': None,
            }
            result.append(search_dict)
    # print("Returning response:", json.dumps(result, indent=2)) 

    return jsonify(result)

@app.route('/search_service', methods=["POST"])
@auth_required('token')
def customer_search():
    try:
        data = request.json
        search = data.get("search", "")

       
        professionals = Professional.query.filter(
            (Professional.pincode.ilike(f"%{search}%")) |
            (Professional.address.ilike(f"%{search}%")) |
            (Professional.service_name.ilike(f"%{search}%"))
        ).all()

        results = []
        if professionals:
            for prof in professionals:
            
                user = User_Info.query.filter_by(email=prof.email).first()
                service=Service.query.filter_by(service_name=prof.service_name).first()
                status = user.active 

                
                results.append({
                    "prof_id": prof.prof_id,
                    "email": prof.email,
                    "name": prof.name,
                    "address": prof.address,
                    "pincode": prof.pincode,
                    "service_name": prof.service_name,
                    "experience": prof.experience,
                    "phone": prof.phone,
                    "rating": prof.rating,
                    "verified": prof.verified,
                    "base_price":service.base_price,
                    "service_id":service.service_id,
                    "status": status
                })

            return jsonify(results)
        return jsonify({"message": "not found!"})

    except Exception as e:
        return jsonify({"message":  str(e)}), 500
    
