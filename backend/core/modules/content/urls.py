from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ContentItemViewSet

router = DefaultRouter()
router.register(r'content', ContentItemViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
