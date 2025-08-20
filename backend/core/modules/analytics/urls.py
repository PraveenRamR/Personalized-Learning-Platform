from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AnalyticsEventViewSet, UserProgressViewSet, ContentMetricsViewSet

# Create a router for our viewsets
router = DefaultRouter()
router.register(r'events', AnalyticsEventViewSet)
router.register(r'progress', UserProgressViewSet)
router.register(r'content-metrics', ContentMetricsViewSet)

# URL patterns for the analytics module
urlpatterns = [
    path('', include(router.urls)),
]
