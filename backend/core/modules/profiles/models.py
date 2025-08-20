from django.conf import settings
from django.db import models
from core.models import Profile

# Import Profile from the main models.py instead of redefining it
# This avoids the conflict while we transition to the modular structure

# Note: The original Profile model is being extended with a recommendations field.
# We need to update the original model to include this field.

# For reference, the extended model would look like:
# class Profile(models.Model):
#     user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile")
#     age = models.PositiveIntegerField(null=True, blank=True)
#     interests = models.JSONField(default=list, blank=True)
#     bio = models.TextField(blank=True)
#     recommendations = models.JSONField(default=list, blank=True, help_text='Stored recommendations from collaborative filtering')
#
#     def __str__(self) -> str:
#         return f"Profile({self.user.username})"
