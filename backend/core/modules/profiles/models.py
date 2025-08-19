from django.conf import settings
from django.db import models

class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile")
    age = models.PositiveIntegerField(null=True, blank=True)
    interests = models.JSONField(default=list, blank=True)
    bio = models.TextField(blank=True)
    recommendations = models.JSONField(default=list, blank=True, help_text='Stored recommendations from collaborative filtering')

    def __str__(self) -> str:
        return f"Profile({self.user.username})"
