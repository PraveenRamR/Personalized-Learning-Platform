from rest_framework import serializers
from .models import ContentItem

class ContentModuleContentItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentItem
        fields = ["id", "title", "description", "url", "content_type", "tags", "created_at"]
