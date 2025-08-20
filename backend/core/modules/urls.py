from django.urls import path, include

urlpatterns = [
    # Authentication URLs
    path('auth/', include('core.modules.auth.urls')),
    
    # Profile URLs
    path('', include('core.modules.profiles.urls')),
    
    # Content URLs
    path('', include('core.modules.content.urls')),
    
    # Interaction URLs
    path('', include('core.modules.interactions.urls')),
    
    # Recommendation URLs
    path('', include('core.modules.recommendations.urls')),
    
    # Analytics URLs - new non-disruptive addition
    path('analytics/', include('core.modules.analytics.urls')),
    
    # Dashboard URLs - aggregated data for frontend dashboard
    path('dashboard/', include('core.modules.dashboard.urls')),
]
