from asgiref.sync import async_to_sync
from celery import shared_task
from channels.layers import get_channel_layer
from django.db.models import Avg, Count
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)


@shared_task
def enqueue_recommendation_refresh(user_id: int) -> None:
	channel_layer = get_channel_layer()
	group = f"user_{user_id}_recs"
	async_to_sync(channel_layer.group_send)(
		group,
		{"type": "recommendation.update", "message": {"event": "refresh", "user_id": user_id}},
	)


@shared_task
def process_content_interaction(interaction_id):
    from .models import Interaction
    logger.info(f"Processing content interaction: {interaction_id}")
    try:
        interaction = Interaction.objects.get(id=interaction_id)
        # Process interaction for recommendations
        logger.info(f"Successfully processed interaction for user {interaction.user.id} on content {interaction.content_item.id}")
        
        # Update analytics metrics
        update_content_metrics(interaction.content_item.id)
        
    except Exception as e:
        logger.error(f"Error processing interaction {interaction_id}: {str(e)}")


@shared_task
def update_content_metrics(content_item_id=None):
    """
    Update content metrics for a specific content item or all content items
    """
    from .models import ContentItem, Interaction
    try:
        from .modules.analytics.models import ContentMetrics
    except ImportError:
        # Fall back if the module isn't available
        from .models import ContentMetrics
    
    try:
        if content_item_id:
            # Update metrics for a specific content item
            content_items = ContentItem.objects.filter(id=content_item_id)
        else:
            # Update metrics for all content items
            content_items = ContentItem.objects.all()
            
        for content_item in content_items:
            # Get view count
            view_count = Interaction.objects.filter(
                content_item=content_item,
                action='viewed'
            ).count()
            
            # Get completion rate (percentage of users who completed the content)
            completion_count = Interaction.objects.filter(
                content_item=content_item,
                action='completed'
            ).values('user').distinct().count()
            
            view_user_count = Interaction.objects.filter(
                content_item=content_item,
                action='viewed'
            ).values('user').distinct().count()
            
            completion_rate = 0
            if view_user_count > 0:
                completion_rate = (completion_count / view_user_count) * 100
                
            # Get average rating
            ratings = Interaction.objects.filter(
                content_item=content_item,
                action='liked'
            ).values_list('score', flat=True)
            
            avg_rating = 0
            if ratings.exists():
                avg_rating = sum(ratings) / len(ratings)
                
            # Update or create metrics
            ContentMetrics.objects.update_or_create(
                content_item=content_item,
                defaults={
                    'view_count': view_count,
                    'completion_rate': completion_rate,
                    'avg_rating': avg_rating,
                    'last_updated': timezone.now()
                }
            )
            
            logger.info(f"Updated metrics for content item {content_item.id}")
            
    except Exception as e:
        logger.error(f"Error updating content metrics: {str(e)}")


@shared_task
def update_user_progress():
    """
    Update user progress data daily
    """
    from django.contrib.auth.models import User
    from .models import ContentItem, Interaction
    try:
        from .modules.analytics.models import UserProgress
    except ImportError:
        # Fall back if the module isn't available
        from .models import UserProgress
    
    try:
        users = User.objects.all()
        content_items = ContentItem.objects.all()
        
        for user in users:
            for content_item in content_items:
                # Calculate progress percentage based on interactions
                interactions = Interaction.objects.filter(
                    user=user,
                    content_item=content_item
                )
                
                if interactions.exists():
                    # Determine progress percentage based on interaction types
                    progress = 0
                    
                    if interactions.filter(action='viewed').exists():
                        progress += 25
                    
                    if interactions.filter(action='liked').exists():
                        progress += 25
                        
                    if interactions.filter(action='completed').exists():
                        progress += 50
                    
                    # Update or create user progress
                    UserProgress.objects.update_or_create(
                        user=user,
                        content_item=content_item,
                        defaults={
                            'progress_percentage': progress,
                            'last_updated': timezone.now()
                        }
                    )
                    
        logger.info("Successfully updated user progress data")
                    
    except Exception as e:
        logger.error(f"Error updating user progress: {str(e)}")


@shared_task
def aggregate_analytics_data():
    """
    Aggregate analytics data for faster dashboard queries
    """
    try:
        from .modules.analytics.models import AnalyticsEvent, DailyActivityMetrics
    except ImportError:
        # Fall back if the module isn't available
        from .models import AnalyticsEvent, DailyActivityMetrics
    from django.contrib.auth.models import User
    
    try:
        # Get today's date
        today = timezone.now().date()
        
        # Get all users
        users = User.objects.all()
        
        for user in users:
            # Count login events
            login_count = AnalyticsEvent.objects.filter(
                user=user,
                event_type='login',
                timestamp__date=today
            ).count()
            
            # Count content view events
            content_view_count = AnalyticsEvent.objects.filter(
                user=user,
                event_type='content_view',
                timestamp__date=today
            ).count()
            
            # Count search events
            search_count = AnalyticsEvent.objects.filter(
                user=user,
                event_type='search',
                timestamp__date=today
            ).count()
            
            # Create or update daily activity metrics
            DailyActivityMetrics.objects.update_or_create(
                user=user,
                date=today,
                defaults={
                    'login_count': login_count,
                    'content_view_count': content_view_count,
                    'search_count': search_count
                }
            )
        
        logger.info(f"Successfully aggregated analytics data for {today}")
            
    except Exception as e:
        logger.error(f"Error aggregating analytics data: {str(e)}")
