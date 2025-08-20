from django.contrib import admin

from .models import ContentItem, Interaction, Profile
from .modules.analytics.models import AnalyticsEvent, UserProgress, ContentMetrics


@admin.register(AnalyticsEvent)
class AnalyticsEventAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'event_type', 'timestamp')
    list_filter = ('event_type', 'timestamp')
    search_fields = ('user__username', 'event_type')


@admin.register(UserProgress)
class UserProgressAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'total_content_viewed', 'quizzes_completed', 'last_activity')
    list_filter = ('learning_streak', 'last_activity')
    search_fields = ('user__username',)


@admin.register(ContentMetrics)
class ContentMetricsAdmin(admin.ModelAdmin):
    list_display = ('id', 'content_item', 'view_count', 'completion_rate', 'popularity_score', 'last_updated')
    list_filter = ('completion_rate', 'difficulty_rating', 'last_updated')
    search_fields = ('content_item__title',)


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'age')
    search_fields = ('user__username',)
    list_filter = ('age',)


@admin.register(ContentItem)
class ContentItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'content_type', 'created_at')
    search_fields = ('title', 'description')
    list_filter = ('content_type',)


@admin.register(Interaction)
class InteractionAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'content_item', 'action', 'score', 'timestamp')
    search_fields = ('user__username', 'content_item__title')
    list_filter = ('action',)


