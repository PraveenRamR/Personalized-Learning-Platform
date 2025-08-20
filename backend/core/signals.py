from django.contrib.auth import get_user_model
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth.signals import user_logged_in
import json
from datetime import datetime

from .models import Profile, Interaction
 # Removed Celery task imports for demonstration
try:
    # Try to import from modular structure first
    from .modules.analytics.models import AnalyticsEvent
except ImportError:
    # Fall back to direct import if module import fails
    from .models import AnalyticsEvent

User = get_user_model()


@receiver(post_save, sender=User)
def create_profile(sender, instance, created, **kwargs):
	if created:
		Profile.objects.create(user=instance)


@receiver(post_save, sender=User)
def save_profile(sender, instance, **kwargs):
	if hasattr(instance, "profile"):
		instance.profile.save()


@receiver(post_save, sender=Interaction)
def handle_interaction(sender, instance, created, **kwargs):
    """
    When a user interacts with content:
    1. Refresh their recommendation websocket
    2. Process interaction for analytics
    3. Create an analytics event
    """
    if created and instance.user:
        # Refresh recommendations
    # Removed Celery task call for demonstration
        
        # Process interaction for analytics
    # Removed Celery task call for demonstration
        
        # Create an analytics event for content interaction
        event_type = instance.action
        
        metadata = {
            'interaction_id': instance.id,
            'interaction_type': instance.action,
            'score': instance.score
        }
        
        if hasattr(instance, 'context') and instance.context:
            metadata.update(instance.context)
            
        AnalyticsEvent.objects.create(
            user=instance.user,
            content_item=instance.content_item,
            event_type=event_type,
            metadata=metadata
        )


@receiver(user_logged_in)
def track_user_login(sender, request, user, **kwargs):
    """
    Track user login events for analytics
    """
    # Get user agent information if available
    if request:
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        ip_address = request.META.get('REMOTE_ADDR', '')
        
        event_data = {
            'user_agent': user_agent,
            'ip_address': ip_address,
            'timestamp': datetime.now().isoformat()
        }
    else:
        event_data = {
            'timestamp': datetime.now().isoformat()
        }
    
    # Create analytics event for login
    AnalyticsEvent.objects.create(
        user=user,
        event_type='login',
        metadata=event_data
    )


