from rest_framework import views, permissions
from rest_framework.response import Response
from django.db.models import Count, Sum
from django.utils import timezone
from datetime import timedelta, datetime

from ..analytics.models import AnalyticsEvent, UserProgress, ContentMetrics
from ..content.models import ContentItem
from ..interactions.models import Interaction

class DashboardAPIView(views.APIView):
    """
    API endpoint for retrieving aggregated dashboard data.
    This combines data from multiple sources into a single dashboard response.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        # Get the time period from query params (default to week)
        period = request.query_params.get('period', 'week')
        
        # Determine date range based on period
        now = timezone.now()
        if period == 'day':
            start_date = now - timedelta(days=1)
        elif period == 'week':
            start_date = now - timedelta(weeks=1)
        elif period == 'month':
            start_date = now - timedelta(days=30)
        elif period == 'year':
            start_date = now - timedelta(days=365)
        else:
            start_date = now - timedelta(weeks=1)  # Default to week
        
        # Get user progress data
        user_progress, created = UserProgress.objects.get_or_create(user=request.user)
        
        # Get learning progress data
        learning_progress_data = {
            'contentCompleted': user_progress.total_content_viewed,
            'totalTimeSpent': user_progress.total_time_spent // 60,  # Convert seconds to minutes
            'lastAccessDate': user_progress.last_activity.isoformat() if user_progress.last_activity else now.isoformat(),
            'learningStreak': user_progress.learning_streak,
            'topSubjects': []
        }
        
        # Add top subjects
        if user_progress.topic_progress:
            learning_progress_data['topSubjects'] = [
                {'subject': k, 'count': v} 
                for k, v in sorted(
                    user_progress.topic_progress.items(), 
                    key=lambda x: x[1], 
                    reverse=True
                )[:5]
            ]
        
        # Get recommendation stats
        recommendations = ContentItem.objects.filter(
            recommendation__user=request.user
        ).distinct()
        
        viewed_recommendations = recommendations.filter(
            interactions__user=request.user,
            interactions__action='viewed'
        ).distinct()
        
        liked_recommendations = recommendations.filter(
            interactions__user=request.user,
            interactions__action='liked'
        ).distinct()
        
        recommendation_stats = {
            'totalRecommendations': recommendations.count(),
            'viewedRecommendations': viewed_recommendations.count(),
            'likedRecommendations': liked_recommendations.count(),
            'interactionRate': viewed_recommendations.count() / max(recommendations.count(), 1)
        }
        
        # Get recent activity
        recent_events = AnalyticsEvent.objects.filter(
            user=request.user,
            timestamp__gte=start_date
        ).order_by('-timestamp')[:10]
        
        recent_activity = []
        for event in recent_events:
            activity_item = {
                'id': str(event.id),
                'timestamp': event.timestamp.isoformat(),
                'metadata': event.metadata or {}
            }
            
            if event.event_type == 'view':
                activity_item['type'] = 'view'
                activity_item['contentTitle'] = event.content_item.title if event.content_item else 'Content'
                activity_item['contentId'] = str(event.content_item.id) if event.content_item else None
            elif event.event_type == 'complete':
                activity_item['type'] = 'complete'
                activity_item['contentTitle'] = event.content_item.title if event.content_item else 'Content'
                activity_item['contentId'] = str(event.content_item.id) if event.content_item else None
            elif event.event_type == 'recommendation_click':
                activity_item['type'] = 'like'
                activity_item['contentTitle'] = event.content_item.title if event.content_item else 'Content'
                activity_item['contentId'] = str(event.content_item.id) if event.content_item else None
            
            recent_activity.append(activity_item)
            
        # Get goal progress data
        # For now, we'll just create mock goals based on user's progress
        goal_progress = [
            {
                'id': '1',
                'title': 'Complete Content Items',
                'target': 10,
                'current': min(user_progress.total_content_viewed, 10),
                'unit': 'items',
            },
            {
                'id': '2',
                'title': 'Maintain Learning Streak',
                'target': 7,
                'current': min(user_progress.learning_streak, 7),
                'unit': 'days',
            },
            {
                'id': '3',
                'title': 'Explore New Topics',
                'target': 5,
                'current': min(len(user_progress.topic_progress or {}), 5),
                'unit': 'topics',
            }
        ]
        
        # Combine all data into dashboard response
        dashboard_data = {
            'learningProgress': learning_progress_data,
            'recommendationStats': recommendation_stats,
            'recentActivity': recent_activity,
            'goalProgress': goal_progress
        }
        
        return Response(dashboard_data)
