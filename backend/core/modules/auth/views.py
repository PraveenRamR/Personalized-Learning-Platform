from django.contrib.auth.models import User
from rest_framework import status, viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import UserSerializer

class UserViewSet(viewsets.ViewSet):
    def create_user(self, username, password, email=None, first_name=None, last_name=None):
        return User.objects.create_user(
            username=username,
            password=password,
            email=email,
            first_name=first_name,
            last_name=last_name
        )
    
    @action(detail=False, methods=["post"], url_path="register")
    def register(self, request):
        try:
            username = request.data.get("username")
            password = request.data.get("password")
            email = request.data.get("email", "")
            first_name = request.data.get("first_name", "")
            last_name = request.data.get("last_name", "")
            
            user = self.create_user(
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
