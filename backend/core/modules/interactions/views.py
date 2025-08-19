from rest_framework import viewsets, permissions
from .models import Interaction
from .serializers import InteractionSerializer
from ..recommendations.tasks import enqueue_recommendation_refresh

class InteractionViewSet(viewsets.ModelViewSet):
    serializer_class = InteractionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        # Only show interactions for the current user
        return Interaction.objects.filter(user=self.request.user)
        
    def perform_create(self, serializer):
        instance = serializer.save(user=self.request.user)
        # Trigger recommendation refresh when a new interaction is created
        enqueue_recommendation_refresh.delay(user_id=self.request.user.id)
        return instance
