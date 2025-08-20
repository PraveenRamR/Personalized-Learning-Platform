from django.conf import settings
from django.db import models
from core.models import Interaction, ContentItem

# Import models from the main models.py instead of redefining them
# This avoids the conflict while we transition to the modular structure

# For future reference, the model looks like this:
# class Interaction(models.Model):
#     user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="interactions")
#     content_item = models.ForeignKey(ContentItem, on_delete=models.CASCADE, related_name="interactions")
#     action = models.CharField(max_length=50)  # viewed, liked, completed, etc.
#     score = models.FloatField(default=0.0)
#     timestamp = models.DateTimeField(auto_now_add=True)
#     context = models.JSONField(default=dict, blank=True)  # Additional context information
#
#     class Meta:
#         ordering = ["-timestamp"]
#
#     def __str__(self) -> str:
#         return f"{self.user} {self.action} {self.content_item}"
