Household_service_app

Step-1: Crete virtual environment  using 'python3 -m venv venv' and activate it using 'source venv/bin/activate' and install requirements.txt using command 'pip install -r requirements.txt'
Step-2: Run flask app using command 'python3 app.py' .
Step-3: Start redis server using command 'sudo service redis-server start'.
Step-4: Run mail_service.py using commnad ' python3 backend/celery/mail_service.py'.
Step-5: Start MailHog for UI using command '~/go/bin/MailHog'.
Step-6: Start Celery worker using command 'celery -A app:celery_app worker -l INFO'.
Step-7: Start Celery beat using command 'celery -A app:celery_app beat -l INFO'.

