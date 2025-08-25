from rest_framework import viewsets, permissions
from .models import ContentItem
from .serializers import ContentModuleContentItemSerializer

class ContentItemViewSet(viewsets.ModelViewSet):
    queryset = ContentItem.objects.all()
    serializer_class = ContentModuleContentItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = ContentItem.objects.all()
        
        # Filter by content_type if provided
        content_type = self.request.query_params.get('content_type', None)
        if content_type:
            queryset = queryset.filter(content_type=content_type)
            
        # Filter by tag if provided
        tag = self.request.query_params.get('tag', None)
        if tag:
            queryset = queryset.filter(tags__contains=[tag])
            
        return queryset
