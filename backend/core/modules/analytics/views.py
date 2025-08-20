from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Sum
from django.utils import timezone
from datetime import timedelta

from .models import AnalyticsEvent, UserProgress, ContentMetrics
from .serializers import AnalyticsEventSerializer, UserProgressSerializer, ContentMetricsSerializer

class IsAdminUserOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow admins to edit objects.
    Read permissions are allowed to any authenticated user.
    """
    def has_permission(self, request, view):
        return (
            request.method in permissions.SAFE_METHODS and
            request.user and 
            request.user.is_authenticated
        ) or (request.user and request.user.is_staff)

class AnalyticsEventViewSet(viewsets.ModelViewSet):
    """
    API endpoint for tracking user analytics events.
    """
    queryset = AnalyticsEvent.objects.all()
    serializer_class = AnalyticsEventSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Restrict regular users to only see their own analytics events"""
        if self.request.user.is_staff:
            return AnalyticsEvent.objects.all()
        return AnalyticsEvent.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        """Save the current user with the event and update UserProgress if needed"""
        instance = serializer.save(user=self.request.user)
        # Update UserProgress for 'view' event
        from .models import UserProgress
        if instance.event_type == 'view':
            user_progress, created = UserProgress.objects.get_or_create(user=self.request.user)
            user_progress.total_content_viewed += 1
            # Add duration if present
            if instance.duration:
                user_progress.total_time_spent += instance.duration
            # Update topic_progress for all topics/tags/categories viewed
            topics = []
            if instance.metadata:
                # Accepts: category, tag, topic as string or list
                for key in ['category', 'tag', 'topic']:
                    value = instance.metadata.get(key)
                    if value:
                        if isinstance(value, list):
                            topics.extend(value)
                        else:
                            topics.append(value)
            if topics:
                topic_progress = user_progress.topic_progress or {}
                for topic in topics:
                    topic_progress[topic] = topic_progress.get(topic, 0) + 1
                user_progress.topic_progress = topic_progress
            user_progress.save()
        return instance
    
    @action(detail=False, methods=['post'])
    def track(self, request):
        """
        Simplified endpoint for tracking events from the frontend.
        Non-disruptive addition that doesn't modify existing behavior.
        Also updates UserProgress for 'view' events.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = self.perform_create(serializer)
        return Response(self.get_serializer(instance).data, status=status.HTTP_201_CREATED)

class UserProgressViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for retrieving user learning progress.
    Read-only to ensure no disruption to existing functionality.
    """
    queryset = UserProgress.objects.all()
    serializer_class = UserProgressSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Regular users can only see their own progress"""
        if self.request.user.is_staff:
            return UserProgress.objects.all()
        return UserProgress.objects.filter(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def my_progress(self, request):
        """Get the current user's progress"""
        progress, created = UserProgress.objects.get_or_create(user=request.user)
        serializer = self.get_serializer(progress)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def learning_summary(self, request):
        """Provide a summary of learning progress"""
        if not request.user.is_authenticated:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Get or create user progress
        progress, created = UserProgress.objects.get_or_create(user=request.user)
        
        # Get recent analytics events
        thirty_days_ago = timezone.now() - timedelta(days=30)
        recent_events = AnalyticsEvent.objects.filter(
            user=request.user,
            timestamp__gte=thirty_days_ago
        )
        
        # Calculate activity by day
        daily_activity = recent_events.values('timestamp__date').annotate(
            count=Count('id'),
            time_spent=Sum('duration')
        ).order_by('timestamp__date')
        
        # Get top content categories
        top_categories = []
        if progress.topic_progress:
            top_categories = sorted(
                progress.topic_progress.items(), 
                key=lambda x: x[1], 
                reverse=True
            )[:5]
        
        return Response({
            'learning_streak': progress.learning_streak,
            'total_content_viewed': progress.total_content_viewed,
            'quizzes_completed': progress.quizzes_completed,
            'total_time_spent': progress.total_time_spent,
            'daily_activity': list(daily_activity),
            'top_categories': top_categories
        })

class ContentMetricsViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for content metrics.
    Read-only to ensure no disruption to core functionality.
    """
    queryset = ContentMetrics.objects.all()
    serializer_class = ContentMetricsSerializer
    permission_classes = [IsAdminUserOrReadOnly]
    
    @action(detail=False, methods=['get'])
    def popular_content(self, request):
        """Get most popular content based on metrics"""
        metrics = ContentMetrics.objects.order_by('-popularity_score')[:10]
        serializer = self.get_serializer(metrics, many=True)
        return Response(serializer.data)
