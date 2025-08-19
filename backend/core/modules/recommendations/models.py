from django.db import models
from django.conf import settings
from ..content.models import ContentItem

class RecommendationLog(models.Model):
    """Track recommended items and the algorithm used to generate them"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="recommendation_logs")
    content_item = models.ForeignKey(ContentItem, on_delete=models.CASCADE, related_name="recommendation_logs")
    algorithm = models.CharField(max_length=100)  # Which algorithm recommended this
    score = models.FloatField(default=0.0)  # Recommendation confidence/score
    served_at = models.DateTimeField(auto_now_add=True)
    interacted = models.BooleanField(default=False)  # Whether the user interacted with this recommendation
    
    class Meta:
        ordering = ["-served_at"]
        
    def __str__(self):
        return f"{self.algorithm} recommended {self.content_item} to {self.user}"
