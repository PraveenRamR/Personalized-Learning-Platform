from asgiref.sync import async_to_sync
from celery import shared_task
from channels.layers import get_channel_layer

@shared_task
def enqueue_recommendation_refresh(user_id: int) -> None:
    """
    Trigger a WebSocket event to refresh recommendations for a user.
    """
    channel_layer = get_channel_layer()
    group = f"user_{user_id}_recs"
    async_to_sync(channel_layer.group_send)(
        group,
        {"type": "recommendation.update", "message": {"event": "refresh", "user_id": user_id}},
    )
