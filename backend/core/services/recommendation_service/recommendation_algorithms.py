"""
Implementation of recommendation algorithms
"""
from django.contrib.auth.models import User
from django.db.models import QuerySet, Count, Q
import numpy as np
from typing import List, Dict, Any, Optional

from ...modules.content.models import ContentItem
from ...modules.interactions.models import Interaction

def generate_recommendations(user: User) -> QuerySet:
    """
    Generate content recommendations for a user based on their interactions
    and profile information. Implements a simple content-based filtering.
    
    Args:
        user: The user to generate recommendations for
        
    Returns:
        QuerySet of ContentItem objects recommended for the user
    """
    # Get user's interests from profile
    interests = getattr(user.profile, "interests", []) if hasattr(user, "profile") else []
    
    # Get content the user has already interacted with
    interacted_content_ids = Interaction.objects.filter(user=user).values_list('content_item_id', flat=True)
    
    # Start with all content not yet interacted with
    recommendations = ContentItem.objects.exclude(id__in=interacted_content_ids)
    
    # If user has interests, prioritize content matching those interests
    if interests:
        q = Q()
        for tag in interests:
            q |= Q(tags__icontains=tag)
        
        # Combine interest-based items with some general recommendations
        interest_matches = recommendations.filter(q).order_by("-created_at")
        general_items = recommendations.exclude(q).order_by("-created_at")[:5]
        
        # Return a mix, prioritizing interest matches
        return list(interest_matches[:15]) + list(general_items)
    
    # If no interests, return newest content
    return recommendations.order_by("-created_at")[:20]
