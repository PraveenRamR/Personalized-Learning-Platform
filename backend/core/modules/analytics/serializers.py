from rest_framework import serializers
from .models import AnalyticsEvent, UserProgress, ContentMetrics

class AnalyticsEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnalyticsEvent
        fields = ['id', 'user', 'content_item', 'event_type', 'timestamp', 'duration', 'metadata']
        read_only_fields = ['user']

class UserProgressSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProgress
        fields = [
            'id', 'user', 'total_content_viewed', 'total_time_spent', 
            'quizzes_attempted', 'quizzes_completed', 'last_activity',
            'learning_streak', 'topic_progress'
        ]
        read_only_fields = ['user']

class ContentMetricsSerializer(serializers.ModelSerializer):
    content_title = serializers.CharField(source='content_item.title', read_only=True)
    
    class Meta:
        model = ContentMetrics
        fields = [
            'id', 'content_item', 'content_title', 'view_count', 
            'completion_rate', 'avg_time_spent', 'popularity_score',
            'difficulty_rating', 'last_updated'
        ]
        read_only_fields = ['content_item']
