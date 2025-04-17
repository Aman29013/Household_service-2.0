from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin,RoleMixin

db=SQLAlchemy()
class User_Info(db.Model,UserMixin):
    __tablename__ = 'user_info'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)
   
    active = db.Column(db.Boolean, default=True, nullable=False)
    fs_uniquifier = db.Column(db.String, unique=True, nullable=False)

    roles = db.relationship('Role', backref='bearers', secondary='user_roles')

    professional = db.relationship('Professional', uselist=False, backref='user_info', cascade="all,delete")
    customer = db.relationship('Customer', uselist=False, backref='user_info', cascade="all,delete")
    
class Role(db.Model,RoleMixin):
    __tablename__ = 'role'
    id=db.Column(db.Integer, primary_key=True, autoincrement=True)
    name=db.Column(db.String, unique=True, nullable=False)

class UserRoles(db.Model):
    __tablename__='user_roles'
    id=id=db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id=db.Column(db.Integer,db.ForeignKey('user_info.id'))
    role_id=db.Column(db.Integer,db.ForeignKey('role.id'))


class Customer(db.Model):
    __tablename__ = 'customer'
    
    cust_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String, db.ForeignKey('user_info.email', ondelete='CASCADE'), unique=True, nullable=False)
    name = db.Column(db.String, nullable=False)
    address = db.Column(db.String, nullable=False)
    pincode = db.Column(db.Integer, nullable=False)
    phone = db.Column(db.String, nullable=False)
    # block_status = db.Column(db.String, default='active')
    service_req = db.relationship("Service_Request", cascade="all,delete", backref="customer", lazy=True)
    

class Professional(db.Model):
    __tablename__ = 'professional'
    
    prof_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String, db.ForeignKey('user_info.email'), unique=True, nullable=False)
    name = db.Column(db.String, nullable=False)
    address = db.Column(db.String, nullable=False)
    pincode = db.Column(db.Integer, nullable=False)
    service_name=db.Column(db.String, db.ForeignKey('service.service_name') , nullable=False)
    experience = db.Column(db.Integer, nullable=False)
    phone = db.Column(db.String, nullable=False)
    verified=db.Column(db.Boolean, default=False)
    # block_status = db.Column(db.String, default='active')
    
    rating=db.Column(db.Float)
    service_request = db.relationship("Service_Request", cascade="all,delete", backref="professional", lazy=True)

class Service(db.Model):
    __tablename__ = 'service'
    
    service_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    service_name = db.Column(db.String,unique=True,nullable=False)
    base_price = db.Column(db.Integer, nullable=False)
    
   
    assosiated_prof=db.relationship('Professional',cascade="all,delete",backref="service",lazy=True)
    service_Req=db.relationship('Service_Request',cascade="all,delete", backref="service", lazy=True)

class Service_Request(db.Model):
    __tablename__ = 'service_request'
    
    request_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    customer_email = db.Column(db.String, db.ForeignKey('customer.email'), nullable=False)
    offered_price=db.Column(db.Integer,nullable=False)
    professional_email = db.Column(db.String, db.ForeignKey('professional.email', ondelete='CASCADE'),default="No")
    service_id = db.Column(db.Integer, db.ForeignKey('service.service_id'), nullable=False)
    requested_date = db.Column(db.DateTime, nullable=False)
    closed_date = db.Column(db.DateTime,)
    rating=db.Column(db.Integer)
    status = db.Column(db.Enum('approved','pending', 'closed'), default="pending",nullable=False)

