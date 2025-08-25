from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.request import Request
from rest_framework.response import Response
from django.db.models import Q
from typing import List

from .models import RecommendationLog
from .serializers import RecommendationLogSerializer
from ..content.models import ContentItem
from ..content.serializers import ContentModuleContentItemSerializer
from ...services.recommendation_service.service import generate_recommendations

class RecommendationViewSet(viewsets.ViewSet):
    @action(detail=False, methods=["post"], url_path="refresh")
    def refresh(self, request: Request) -> Response:
        """Trigger recommendation refresh for the user asynchronously via Celery."""
        user = request.user
        from core.tasks import enqueue_recommendation_refresh
        import logging
        logging.getLogger(__name__).info(f"Triggering Celery task for user {user.id}")
        enqueue_recommendation_refresh.delay(user.id)
        return Response({"status": "refresh triggered"}, status=status.HTTP_202_ACCEPTED)
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=["get"], url_path="personalized")
    def personalized(self, request: Request) -> Response:
        """Get personalized recommendations based on user profile and interactions"""
        user = request.user
        
        # Get recommendations from the service
        recommended_items = generate_recommendations(user)
        
        # If no items returned from service, fall back to interest-based filtering
        if not recommended_items:
            interests: List[str] = getattr(user.profile, "interests", []) if hasattr(user, "profile") else []
            qs = ContentItem.objects.all()
            if interests:
                q = Q()
                for tag in interests:
                    q |= Q(tags__icontains=tag)
                qs = qs.filter(q)
            recommended_items = qs.order_by("-created_at")[:20]
        
        # Log the recommendations
        for item in recommended_items:
            RecommendationLog.objects.create(
                user=user,
                content_item=item,
                algorithm="personalized",
                score=1.0  # Default score
            )
        
        data = ContentModuleContentItemSerializer(recommended_items, many=True).data
        return Response({"results": data})
    
    @action(detail=False, methods=["get"], url_path="history")
    def history(self, request: Request) -> Response:
        """Get the user's recommendation history"""
        logs = RecommendationLog.objects.filter(user=request.user).select_related("content_item")
        serializer = RecommendationLogSerializer(logs, many=True)
        return Response(serializer.data)
