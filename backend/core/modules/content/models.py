from django.db import models

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
