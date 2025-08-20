from django.db.models import Count, Sum, Avg, F, ExpressionWrapper, fields
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model
from ..models import AnalyticsEvent, ContentMetrics
from ...content.models import ContentItem

User = get_user_model()

class AnalyticsService:
    """
    Service class for analytics operations.
    Keeps business logic separate from views.
    """
    
    @staticmethod
    def get_user_activity_summary(user_id, days=30):
        """
        Get activity summary for a specific user over the specified time period.
        """
        user = User.objects.get(id=user_id)
        start_date = timezone.now() - timedelta(days=days)
        
        # Get events in the time period
        events = AnalyticsEvent.objects.filter(
            user=user,
            timestamp__gte=start_date
        )
        
        # Calculate activity metrics
        daily_activity = events.values('timestamp__date').annotate(
            events=Count('id'),
            time_spent=Sum('duration')
        ).order_by('timestamp__date')
        
        # Calculate content type breakdown
        content_types = events.filter(
            content_item__isnull=False
        ).values(
            'content_item__content_type'
        ).annotate(
            count=Count('id')
        ).order_by('-count')
        
        # Calculate top tags
        tag_counts = {}
        for event in events.filter(content_item__isnull=False):
            if not event.content_item or not event.content_item.tags:
                continue
                
            for tag in event.content_item.tags:
                if tag in tag_counts:
                    tag_counts[tag] += 1
                else:
                    tag_counts[tag] = 1
        
        top_tags = [
            {"tag": tag, "count": count} 
            for tag, count in sorted(tag_counts.items(), key=lambda x: x[1], reverse=True)[:10]
        ]
        
        return {
            "daily_activity": list(daily_activity),
            "content_types": list(content_types),
            "top_tags": top_tags,
            "total_events": events.count(),
            "total_time": events.aggregate(Sum('duration'))['duration__sum'] or 0
        }
    
    @staticmethod
    def get_platform_insights(days=30):
        """
        Get overall platform insights.
        Admin-only function.
        """
        start_date = timezone.now() - timedelta(days=days)
        
        # Active users
        active_users = User.objects.filter(
            analytics_events__timestamp__gte=start_date
        ).distinct().count()
        
        # Content engagement 
        content_engagement = ContentItem.objects.annotate(
            view_count=Count('analytics_events', filter=F('analytics_events__event_type') == 'view'),
            completion_count=Count('analytics_events', filter=F('analytics_events__event_type') == 'complete'),
        ).filter(
            analytics_events__timestamp__gte=start_date
        ).aggregate(
            total_views=Sum('view_count'),
            total_completions=Sum('completion_count')
        )
        
        # Calculate overall completion rate
        completion_rate = 0
        if content_engagement['total_views'] and content_engagement['total_views'] > 0:
            completion_rate = (content_engagement['total_completions'] / content_engagement['total_views']) * 100
            
        # Most engaging content
        popular_content = ContentMetrics.objects.order_by('-popularity_score')[:10].values(
            'content_item__id', 
            'content_item__title',
            'view_count',
            'completion_rate',
            'avg_time_spent'
        )
            
        return {
            "active_users": active_users,
            "content_engagement": content_engagement,
            "completion_rate": completion_rate,
            "popular_content": list(popular_content)
        }
