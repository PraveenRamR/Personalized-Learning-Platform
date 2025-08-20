from django.db.models.signals import post_save
from django.dispatch import receiver
from ..interactions.models import Interaction
from .models import AnalyticsEvent, UserProgress, ContentMetrics
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model

User = get_user_model()

@receiver(post_save, sender=Interaction)
def create_analytics_from_interaction(sender, instance, created, **kwargs):
    """
    Creates analytics events based on user interactions.
    This keeps analytics separate from core functionality.
    """
    if not created:
        return
    
    # Map interaction actions to analytics event types
    event_mapping = {
        'viewed': 'view',
        'liked': 'view',  # We'll count likes as views too
        'completed': 'complete',
        'quiz_submitted': 'quiz_complete',
        'quiz_started': 'quiz_attempt',
    }
    
    event_type = event_mapping.get(instance.action)
    if not event_type:
        return
    
    # Create analytics event
    AnalyticsEvent.objects.create(
        user=instance.user,
        content_item=instance.content_item,
        event_type=event_type,
        duration=instance.context.get('duration') if instance.context else None,
        metadata={
            'score': instance.score,
            'source': 'interaction',
            'context': instance.context
        }
    )
    
    # Update or create user progress
    progress, created = UserProgress.objects.get_or_create(user=instance.user)
    
    if event_type == 'view':
        progress.total_content_viewed += 1
    elif event_type == 'quiz_attempt':
        progress.quizzes_attempted += 1
    elif event_type == 'quiz_complete':
        progress.quizzes_completed += 1
    
    # Update learning streak if needed
    last_activity_date = progress.last_activity.date() if progress.last_activity else None
    today = timezone.now().date()
    
    if last_activity_date is None:
        progress.learning_streak = 1
    elif last_activity_date == today:
        pass  # Already recorded activity today
    elif last_activity_date == today - timedelta(days=1):
        progress.learning_streak += 1
    else:
        progress.learning_streak = 1  # Streak broken, restart
        
    progress.last_activity = timezone.now()
    progress.save()
    
    # Update content metrics
    metrics, created = ContentMetrics.objects.get_or_create(content_item=instance.content_item)
    if event_type == 'view':
        metrics.view_count += 1
    
    # Update other metrics asynchronously to avoid impacting performance
    from .tasks import update_content_metrics
    update_content_metrics.delay(metrics.id)
