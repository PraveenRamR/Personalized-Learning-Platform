from django.conf import settings
from django.db import models


class Profile(models.Model):
	user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile")
	age = models.PositiveIntegerField(null=True, blank=True)
	interests = models.JSONField(default=list, blank=True)
	bio = models.TextField(blank=True)

	def __str__(self) -> str:
		return f"Profile({self.user.username})"


class ContentItem(models.Model):
	TYPE_CHOICES = (
		("article", "Article"),
		("video", "Video"),
		("quiz", "Quiz"),
	)
	title = models.CharField(max_length=255)
	description = models.TextField(blank=True)
	url = models.URLField(blank=True)
	content_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
	tags = models.JSONField(default=list, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)

	def __str__(self) -> str:
		return self.title


class Interaction(models.Model):
	user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="interactions")
	content_item = models.ForeignKey(ContentItem, on_delete=models.CASCADE, related_name="interactions")
	action = models.CharField(max_length=50)  # viewed, liked, completed, etc.
	score = models.FloatField(default=0.0)
	timestamp = models.DateTimeField(auto_now_add=True)
	context = models.JSONField(default=dict, blank=True)  # Adding missing context field

	class Meta:
		ordering = ["-timestamp"]

	def __str__(self) -> str:
		return f"{self.user} {self.action} {self.content_item}"

