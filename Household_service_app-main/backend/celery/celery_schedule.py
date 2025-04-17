
from celery.schedules import crontab
from flask import current_app as app
from backend.celery.tasks import email_reminder,send_daily_status,send_monthly_activity_report
from backend.models import *
from datetime import datetime, timedelta

celery_app=app.extensions['celery']



@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
   
    sender.add_periodic_task(
        crontab(hour=11, minute=57), 
        send_daily_status.s(),
        name='daily reminder'
    )

    sender.add_periodic_task(
        crontab(day_of_month=1, hour=8, minute=0),
        send_monthly_activity_report.s(),
        name='monthly_activity_report'
    )



# sudo service redis-server start
# $HOME/go/bin/MailHog or ~/go/bin/MailHog
# run mail_servic.py backend/celery/mail_service.py
# celery -A app:celery_app worker -l INFO
# celery -A app:celery_app beat -l INFO




