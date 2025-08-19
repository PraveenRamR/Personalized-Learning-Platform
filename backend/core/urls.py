from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
	ContentItemViewSet,
	InteractionViewSet,
	ProfileViewSet,
	RecommendationViewSet,
	UserViewSet,
)

router = DefaultRouter()
router.register(r"users", UserViewSet)
router.register(r"profiles", ProfileViewSet)
router.register(r"content-items", ContentItemViewSet)
router.register(r"interactions", InteractionViewSet, basename="interaction")
router.register(r"recommendations", RecommendationViewSet, basename="recommendation")

urlpatterns = [
	path("", include(router.urls)),
]

