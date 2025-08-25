from rest_framework import serializers
from .models import Interaction
from ..content.serializers import ContentModuleContentItemSerializer

class InteractionSerializer(serializers.ModelSerializer):
    content_item_detail = ContentModuleContentItemSerializer(source='content_item', read_only=True)
    
    class Meta:
        model = Interaction
        fields = ["id", "user", "content_item", "content_item_detail", "action", "score", "timestamp", "context"]
        read_only_fields = ["user"]
        
    def create(self, validated_data):
        # Set the current user as the user for this interaction
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
