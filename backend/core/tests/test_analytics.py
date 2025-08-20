from django.test import TestCase
from django.urls import reverse
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from rest_framework import status
import json
from datetime import datetime, timedelta

from core.models import ContentItem, Interaction
from core.modules.analytics.models import AnalyticsEvent, UserProgress, ContentMetrics


class AnalyticsAPITestCase(TestCase):
    def setUp(self):
        # Create test user
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpassword123'
        )
        
        # Create test content
        self.content_item = ContentItem.objects.create(
            title='Test Content',
            content_type='video',
            description='Test description',
            difficulty='intermediate',
            content_url='https://example.com/test-content'
        )
        
        # Create test interactions
        Interaction.objects.create(
            user=self.user,
            content_item=self.content_item,
            interaction_type='view',
        )
        
        # Create test analytics events
        AnalyticsEvent.objects.create(
            user=self.user,
            event_type='login',
            event_data=json.dumps({'device': 'desktop', 'browser': 'chrome'})
        )
        
        # Create test user progress
        UserProgress.objects.create(
            user=self.user,
            content_item=self.content_item,
            progress_percentage=50,
        )
        
        # Create test content metrics
        ContentMetrics.objects.create(
            content_item=self.content_item,
            view_count=1,
            completion_rate=50.0,
            avg_rating=4.5,
        )
        
        # Setup API client
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
    
    def test_dashboard_api_view(self):
        """Test the dashboard API view returns correct analytics data"""
        url = reverse('dashboard-analytics')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        
        # Check if the response contains expected analytics sections
        self.assertIn('user_activity', data)
        self.assertIn('content_engagement', data)
        self.assertIn('learning_progress', data)
        
    def test_analytics_with_time_filter(self):
        """Test analytics filtering by time period"""
        # Test with period=day
        url = reverse('dashboard-analytics') + '?period=day'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Test with period=week
        url = reverse('dashboard-analytics') + '?period=week'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Test with period=month
        url = reverse('dashboard-analytics') + '?period=month'
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
    
    def test_user_progress_analytics(self):
        """Test retrieving user progress analytics"""
        url = reverse('user-progress')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        
        # Check if the response contains the test user's progress
        self.assertGreaterEqual(len(data), 1)
        self.assertEqual(data[0]['content_item'], self.content_item.id)
        self.assertEqual(data[0]['progress_percentage'], 50)
    
    def test_content_metrics_analytics(self):
        """Test retrieving content metrics analytics"""
        url = reverse('content-metrics', args=[self.content_item.id])
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        
        # Check if the response contains the test content's metrics
        self.assertEqual(data['content_item'], self.content_item.id)
        self.assertEqual(data['view_count'], 1)
        self.assertEqual(data['completion_rate'], 50.0)
        self.assertEqual(data['avg_rating'], 4.5)
