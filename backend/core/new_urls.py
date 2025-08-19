from django.urls import include, path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # JWT Authentication endpoints
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Include all module URLs
    path('api/', include('core.modules.urls')),
    
    # Legacy router URLs - to be removed after migration is complete
    path('api/', include('core.urls')),
]
