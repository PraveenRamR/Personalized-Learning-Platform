from django.db import models
from django.conf import settings

# Import the main models to avoid conflicts
from core.models import ContentItem

class AnalyticsEvent(models.Model):
    """
    Stores individual user interaction events with timestamps.
    Completely separate from core models to avoid disruption.
    """
    EVENT_TYPES = (
        ('view', 'Content View'),
        ('start', 'Learning Started'),
        ('complete', 'Learning Completed'),
        ('quiz_attempt', 'Quiz Attempt'),
        ('quiz_complete', 'Quiz Completed'),
        ('search', 'Search Performed'),
        ('recommendation_click', 'Recommendation Clicked'),
    )

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, 
        on_delete=models.CASCADE,
        related_name='analytics_events'
    )
    content_item = models.ForeignKey(
        ContentItem, 
        on_delete=models.CASCADE,
        related_name='analytics_events',
        null=True,
        blank=True
    )
    event_type = models.CharField(max_length=30, choices=EVENT_TYPES)
    timestamp = models.DateTimeField(auto_now_add=True)
    duration = models.PositiveIntegerField(null=True, blank=True, help_text="Duration in seconds")
    metadata = models.JSONField(default=dict, blank=True, help_text="Additional contextual data")
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', 'event_type']),
            models.Index(fields=['content_item', 'event_type']),
            models.Index(fields=['timestamp']),
        ]
    
    def __str__(self):
        return f"{self.user.username} - {self.event_type} - {self.timestamp.strftime('%Y-%m-%d %H:%M')}"


class UserProgress(models.Model):
    """
    Aggregated user progress data, updated asynchronously
    to avoid impacting core functionality.
    """
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='learning_progress'
    )
    total_content_viewed = models.PositiveIntegerField(default=0)
    total_time_spent = models.PositiveIntegerField(default=0, help_text="Total time in seconds")
    quizzes_attempted = models.PositiveIntegerField(default=0)
    quizzes_completed = models.PositiveIntegerField(default=0)
    last_activity = models.DateTimeField(auto_now=True)
    learning_streak = models.PositiveIntegerField(default=0, help_text="Consecutive days of activity")
    topic_progress = models.JSONField(default=dict, blank=True, help_text="Progress by topic category")
    
    def __str__(self):
        return f"{self.user.username}'s Progress"


class ContentMetrics(models.Model):
    """
    Aggregated metrics about content items.
    Used for analytics without affecting core models.
    """
    content_item = models.OneToOneField(
        ContentItem,
        on_delete=models.CASCADE,
        related_name='metrics'
    )
    view_count = models.PositiveIntegerField(default=0)
    completion_rate = models.FloatField(default=0.0, help_text="Percentage of users who complete the content")
    avg_time_spent = models.PositiveIntegerField(default=0, help_text="Average time spent in seconds")
    popularity_score = models.FloatField(default=0.0)
    difficulty_rating = models.FloatField(default=2.5, help_text="1-5 scale based on user completion time")
    last_updated = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Metrics for {self.content_item.title}"
