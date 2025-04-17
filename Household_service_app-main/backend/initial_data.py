from flask import current_app as app
from backend.models import db
from flask_security import SQLAlchemyUserDatastore,hash_password

with app.app_context():
    db.create_all()

    userdatastore = app.security.datastore

    userdatastore.find_or_create_role(name='admin')
    userdatastore.find_or_create_role(name='customer')
    userdatastore.find_or_create_role(name='professional')

    if (not userdatastore.find_user(email='aman@iitm.ac.in')):
        userdatastore.create_user( email='aman@iitm.ac.in',password=hash_password('aman29'),roles=['admin'])
    db.session.commit()