from celery import shared_task
from django.db.models import Avg, Count, Sum
from django.utils import timezone
from datetime import timedelta

@shared_task
def update_content_metrics(metrics_id):
    """
    Asynchronously update content metrics to avoid impacting user experience.
    """
    from .models import ContentMetrics, AnalyticsEvent
    
    try:
        metrics = ContentMetrics.objects.get(id=metrics_id)
        content_item = metrics.content_item
        
        # Get all view events for this content
        view_events = AnalyticsEvent.objects.filter(
            content_item=content_item,
            event_type='view'
        )
        
        # Get completion events
        completion_events = AnalyticsEvent.objects.filter(
            content_item=content_item,
            event_type='complete'
        )
        
        # Calculate metrics
        metrics.view_count = view_events.count()
        
        if metrics.view_count > 0:
            metrics.completion_rate = (completion_events.count() / metrics.view_count) * 100
        
        # Calculate average time spent
        events_with_duration = view_events.exclude(duration__isnull=True)
        if events_with_duration.exists():
            avg_duration = events_with_duration.aggregate(Avg('duration'))['duration__avg']
            metrics.avg_time_spent = int(avg_duration) if avg_duration else 0
        
        # Calculate popularity score (recent views weighted more heavily)
        recent_views = view_events.filter(
            timestamp__gte=timezone.now() - timedelta(days=30)
        ).count()
        
        metrics.popularity_score = (recent_views * 0.7) + ((metrics.view_count - recent_views) * 0.3)
        
        # Save updated metrics
        metrics.save()
        return f"Updated metrics for content {content_item.id}"
    
    except ContentMetrics.DoesNotExist:
        return f"ContentMetrics with id {metrics_id} not found"
    except Exception as e:
        return f"Error updating metrics: {str(e)}"

@shared_task
def compute_daily_analytics():
    """
    Daily task to compute aggregated analytics without impacting core functionality.
    """
    from .models import UserProgress, ContentMetrics, AnalyticsEvent
    from django.contrib.auth import get_user_model
    
    User = get_user_model()
    yesterday = timezone.now() - timedelta(days=1)
    start_of_yesterday = yesterday.replace(hour=0, minute=0, second=0, microsecond=0)
    end_of_yesterday = start_of_yesterday + timedelta(days=1)
    
    # Process each user's progress
    for user in User.objects.filter(is_active=True):
        progress, created = UserProgress.objects.get_or_create(user=user)
        
        # Get yesterday's events
        user_events = AnalyticsEvent.objects.filter(
            user=user,
            timestamp__range=(start_of_yesterday, end_of_yesterday)
        )
        
        if user_events.exists():
            # User was active yesterday
            if progress.last_activity and progress.last_activity.date() < yesterday.date():
                # Update streak if last activity was before yesterday
                progress.learning_streak = 1
            elif progress.last_activity and progress.last_activity.date() == yesterday.date():
                # Maintain streak if already active yesterday
                pass
            else:
                # Increment streak if last activity was two days ago
                progress.learning_streak += 1
            
            # Update total time spent
            time_spent = user_events.exclude(duration__isnull=True).aggregate(
                total=Sum('duration')
            )['total'] or 0
            progress.total_time_spent += time_spent
            
            # Update topic progress
            topic_counts = {}
            for event in user_events.filter(event_type='view', content_item__isnull=False):
                if event.content_item and event.content_item.tags:
                    for tag in event.content_item.tags:
                        topic_counts[tag] = topic_counts.get(tag, 0) + 1
            
            # Update the topic progress dictionary
            for topic, count in topic_counts.items():
                if topic in progress.topic_progress:
                    progress.topic_progress[topic] += count
                else:
                    progress.topic_progress[topic] = count
            
            progress.save()
    
    return "Daily analytics computation completed"
