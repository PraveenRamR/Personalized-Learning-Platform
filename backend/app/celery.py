import os
from celery import Celery
from celery.schedules import crontab

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "app.settings")

app = Celery("app")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()

# Configure Celery beat schedule
app.conf.beat_schedule = {
    # Update all content metrics once per day
    'update-all-content-metrics-daily': {
        'task': 'core.tasks.update_content_metrics',
        'schedule': crontab(hour=0, minute=0),  # Run at midnight
    },
    # Update user progress daily
    'update-user-progress-daily': {
        'task': 'core.tasks.update_user_progress',
        'schedule': crontab(hour=1, minute=0),  # Run at 1 AM
    },
    # Aggregate analytics data hourly
    'aggregate-analytics-data-minutely': {
        'task': 'core.tasks.aggregate_analytics_data',
        'schedule': crontab(minute='*'),  # Run every minute
    },
}
