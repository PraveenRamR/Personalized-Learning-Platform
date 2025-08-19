from django.contrib.auth.models import User
from django.db.models import QuerySet

from .recommendation_algorithms import generate_recommendations as _generate_recommendations

def generate_recommendations(user: User) -> QuerySet:
    """
    Public interface for generating recommendations.
    This abstraction allows us to switch recommendation algorithms
    or implement A/B testing in the future.
    
    Args:
        user: The user to generate recommendations for
        
    Returns:
        QuerySet of ContentItem objects recommended for the user
    """
    return _generate_recommendations(user)
