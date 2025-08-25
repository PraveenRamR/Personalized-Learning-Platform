from rest_framework import serializers
from .models import RecommendationLog
from ..content.serializers import ContentModuleContentItemSerializer

class RecommendationLogSerializer(serializers.ModelSerializer):
    content_item_detail = ContentModuleContentItemSerializer(source='content_item', read_only=True)
    
    class Meta:
        model = RecommendationLog
        fields = ["id", "user", "content_item", "content_item_detail", "algorithm", "score", "served_at", "interacted"]
        read_only_fields = ["user", "served_at"]
