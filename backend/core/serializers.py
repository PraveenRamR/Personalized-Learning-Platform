from django.contrib.auth.models import User
from rest_framework import serializers
from .models import ContentItem, Interaction, Profile

class CoreUserSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = ["id", "username", "email", "first_name", "last_name", "is_staff"]


class CoreProfileSerializer(serializers.ModelSerializer):
	user = CoreUserSerializer(read_only=True)

	class Meta:
		model = Profile
		fields = ["id", "user", "age", "interests", "bio"]


class CoreContentItemSerializer(serializers.ModelSerializer):
	class Meta:
		model = ContentItem
		fields = ["id", "title", "description", "url", "content_type", "tags", "created_at"]


class InteractionSerializer(serializers.ModelSerializer):
	class Meta:
		model = Interaction
		fields = ["id", "user", "content_item", "action", "score", "timestamp"]
		read_only_fields = ["timestamp", "user"]

	def validate_action(self, value: str) -> str:
		allowed = {"viewed", "liked", "completed", "disliked", "add_interest"}
		if value not in allowed:
			raise serializers.ValidationError(f"Action must be one of {sorted(allowed)}")
		return value

