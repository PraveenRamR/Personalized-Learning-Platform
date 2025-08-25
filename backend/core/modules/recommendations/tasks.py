from asgiref.sync import async_to_sync
from celery import shared_task
 

@shared_task
def enqueue_recommendation_refresh(user_id: int) -> None:
    """
    Trigger a WebSocket event to refresh recommendations for a user.
    """
    # Directly trigger recommendation refresh for user using Celery
    from core.services.recommendation_service.recommendation_algorithms import generate_recommendations
    generate_recommendations(user_id)
