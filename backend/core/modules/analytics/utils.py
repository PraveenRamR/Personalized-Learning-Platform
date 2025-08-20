import json
from django.utils import timezone
from django.contrib.auth.models import User


def track_analytics_event(user, event_type, event_data=None):
    """
    Utility function to track analytics events from anywhere in the application
    
    Parameters:
    - user: User object or user ID
    - event_type: String describing the event (e.g., 'search', 'download', 'share')
    - event_data: Dictionary with additional event data
    
    Returns:
    - AnalyticsEvent object
    """
    from core.modules.analytics.models import AnalyticsEvent
    
    # Convert user ID to User object if needed
    if isinstance(user, int):
        try:
            user = User.objects.get(id=user)
        except User.DoesNotExist:
            return None
    
    # Ensure event_data is a dictionary
    if event_data is None:
        event_data = {}
    
    # Add timestamp if not present
    if 'timestamp' not in event_data:
        event_data['timestamp'] = timezone.now().isoformat()
        
    # Create and return the event
    return AnalyticsEvent.objects.create(
        user=user,
        event_type=event_type,
        event_data=json.dumps(event_data)
    )


def get_period_filter(period):
    """
    Get date filter for specified time period
    
    Parameters:
    - period: String ('day', 'week', 'month', 'year')
    
    Returns:
    - Dictionary with date filter parameters
    """
    from django.utils import timezone
    from datetime import timedelta
    
    now = timezone.now()
    
    if period == 'day':
        start_date = now - timedelta(days=1)
    elif period == 'week':
        start_date = now - timedelta(weeks=1)
    elif period == 'month':
        start_date = now - timedelta(days=30)
    elif period == 'year':
        start_date = now - timedelta(days=365)
    else:
        # Default to all time (no filter)
        return {}
    
    return {'timestamp__gte': start_date}
