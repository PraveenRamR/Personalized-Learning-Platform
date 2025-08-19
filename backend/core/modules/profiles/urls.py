from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProfileViewSet

router = DefaultRouter()
router.register(r'profiles', ProfileViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('me/', ProfileViewSet.as_view({'get': 'me', 'patch': 'me'}), name='profile-me'),
]
