from typing import List

from django.contrib.auth.models import User
from django.db.models import Q
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import ContentItem, Interaction, Profile
from .serializers import ContentItemSerializer, InteractionSerializer, ProfileSerializer, UserSerializer
 # Removed Celery task import for demonstration


class IsSelfOrReadOnly(permissions.BasePermission):
	def has_object_permission(self, request, view, obj) -> bool:
		if request.method in permissions.SAFE_METHODS:
			return True
		return getattr(obj, "user", None) == request.user


class IsAdminUser(permissions.BasePermission):
	def has_permission(self, request, view):
		return request.user and request.user.is_staff


class UserViewSet(viewsets.ReadOnlyModelViewSet):
	queryset = User.objects.all().order_by("id")
	serializer_class = UserSerializer
	permission_classes = [permissions.IsAuthenticated]

	@action(detail=False, methods=["post"], permission_classes=[permissions.AllowAny])
	def register(self, request: Request) -> Response:
		"""Register a new user with profile creation"""
		username = request.data.get("username")
		password = request.data.get("password")
		email = request.data.get("email", "")
		first_name = request.data.get("first_name", "")
		last_name = request.data.get("last_name", "")
		
		if not username or not password:
			return Response(
				{"error": "Username and password are required"}, 
				status=status.HTTP_400_BAD_REQUEST
			)
		
		if User.objects.filter(username=username).exists():
			return Response(
				{"error": "Username already exists"}, 
				status=status.HTTP_400_BAD_REQUEST
			)
		
		try:
			user = User.objects.create_user(
				username=username,
				password=password,
				email=email,
				first_name=first_name,
				last_name=last_name
			)
			
			# Profile will be auto-created via signals
			refresh = RefreshToken.for_user(user)
			return Response({
				"access": str(refresh.access_token),
				"refresh": str(refresh),
				"user": UserSerializer(user).data
			}, status=status.HTTP_201_CREATED)
		except Exception as e:
			return Response(
				{"error": str(e)}, 
				status=status.HTTP_400_BAD_REQUEST
			)


class ProfileViewSet(viewsets.ModelViewSet):
	queryset = Profile.objects.select_related("user").all()
	serializer_class = ProfileSerializer
	permission_classes = [permissions.IsAuthenticated, IsSelfOrReadOnly]

	def perform_create(self, serializer):
		serializer.save(user=self.request.user)

	@action(detail=False, methods=["get", "patch"], url_path="me")
	def me(self, request: Request) -> Response:
		profile, _ = Profile.objects.get_or_create(user=request.user)
		if request.method.lower() == "patch":
			serializer = self.get_serializer(profile, data=request.data, partial=True)
			serializer.is_valid(raise_exception=True)
			serializer.save()
			return Response(serializer.data)
		return Response(self.get_serializer(profile).data)


class ContentItemViewSet(viewsets.ModelViewSet):
	queryset = ContentItem.objects.all().order_by("-created_at")
	serializer_class = ContentItemSerializer
	permission_classes = [permissions.IsAuthenticated]

	def get_permissions(self):
		if self.action in ['create', 'update', 'partial_update', 'destroy']:
			return [IsAdminUser()]
		return [permissions.IsAuthenticated()]

	def perform_create(self, serializer):
		serializer.save()


class InteractionViewSet(viewsets.ModelViewSet):
	queryset = Interaction.objects.select_related("user", "content_item").all()
	serializer_class = InteractionSerializer
	permission_classes = [permissions.IsAuthenticated]

	def perform_create(self, serializer):
		print("DEBUG - User in request:", self.request.user, "Is authenticated:", self.request.user.is_authenticated)
		print("DEBUG - Request data:", serializer.initial_data)
		# Remove user from data if it exists
		if 'user' in serializer.initial_data:
			del serializer.initial_data['user']
		instance = serializer.save(user=self.request.user)
		# Add interest to profile if action is 'add_interest' and tag is provided
		if instance.action == "add_interest":
			tag = serializer.initial_data.get('tag')
			if tag:
				profile, _ = Profile.objects.get_or_create(user=self.request.user)
				interests = profile.interests or []
				if tag not in interests:
					interests.append(tag)
					profile.interests = interests
					profile.save()
		# Update UserProgress for 'viewed' action
		from core.modules.analytics.models import UserProgress
		if instance.action == "viewed":
			user_progress, created = UserProgress.objects.get_or_create(user=self.request.user)
			user_progress.total_content_viewed += 1
			user_progress.save()
		return instance


class RecommendationViewSet(viewsets.ViewSet):
	@action(detail=False, methods=["get"], url_path="liked")
	def liked(self, request: Request) -> Response:
		user = request.user
		# Get IDs of content items liked by the user
		liked_ids = set(
			Interaction.objects.filter(user=user, action='liked').values_list('content_item_id', flat=True)
		)
		qs = ContentItem.objects.filter(id__in=liked_ids)
		data = ContentItemSerializer(qs.order_by("-created_at"), many=True).data
		return Response({"results": data})
	permission_classes = [permissions.IsAuthenticated]

	@action(detail=False, methods=["get"], url_path="personalized")
	def personalized(self, request: Request) -> Response:
		user = request.user
		interests: List[str] = getattr(user.profile, "interests", []) if hasattr(user, "profile") else []
		# Get IDs of content items disliked by the user
		disliked_ids = set(
			Interaction.objects.filter(user=user, action='disliked').values_list('content_item_id', flat=True)
		)
		qs = ContentItem.objects.exclude(id__in=disliked_ids)
		if interests:
			q = Q()
			for tag in interests:
				q |= Q(tags__icontains=tag)
			qs = qs.filter(q)
		data = ContentItemSerializer(qs.order_by("-created_at")[:20], many=True).data
		return Response({"results": data})
