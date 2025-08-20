# Analytics Guide

This document explains how to access and use the analytics features in the Personalized Learning Platform.

## Accessing Analytics

### 1. Dashboard Page

The analytics data is primarily accessible through the Dashboard page. You can access it by:

- **Navigation Bar**: Click on "Dashboard" in the main navigation bar
- **Direct URL**: Navigate to `/dashboard` in your browser
- **From Home Page**: Click on "View Full Dashboard" link in the Analytics Insights card

### 2. Dashboard Components

The dashboard displays various analytics components:

- **Learning Progress**: Shows completion rates, time spent, and learning streak
- **Recommendation Stats**: Displays engagement with recommendations
- **Recent Activity**: Shows your latest interactions
- **Goals Tracker**: Tracks your learning goals

### 3. Time Period Filtering

On the dashboard, you can filter analytics by different time periods:

- Today
- This Week (default)
- This Month
- This Year

This helps you see your progress over different timeframes.

## For Developers

### Using the Analytics Context

You can access analytics functionality programmatically using the Analytics Context:

```tsx
import { useAnalytics } from '../features/analytics/AnalyticsContext';

function MyComponent() {
  const { 
    trackPageView, 
    trackContentView, 
    trackInteraction,
    trackSearch 
  } = useAnalytics();
  
  // Track a page view
  useEffect(() => {
    trackPageView('myPage');
  }, []);
  
  // Track content view
  const handleViewContent = (contentId) => {
    trackContentView(contentId, { title: 'Content Title' });
    // Rest of your logic
  };
}
```

### API Endpoints

The backend provides these REST API endpoints for accessing analytics data:

- **Track Events**: POST `/api/analytics/events/track/`
- **User Progress**: GET `/api/analytics/progress/my_progress/`
- **Learning Summary**: GET `/api/analytics/progress/learning_summary/`
- **Popular Content**: GET `/api/analytics/content-metrics/popular_content/`

### Dashboard Data

The dashboard uses this endpoint to fetch aggregated data:

- GET `/api/dashboard/?period=week` (period can be: day, week, month, year)

### Sample API Usage

```javascript
// Track an event
const trackLearningEvent = async (contentId) => {
  const response = await fetch('/api/analytics/events/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${yourToken}`
    },
    body: JSON.stringify({
      event_type: 'view',
      content_item: contentId,
      metadata: { source: 'homepage' }
    })
  });
  return response.json();
};

// Get user analytics
const getUserAnalytics = async () => {
  const response = await fetch('/api/analytics/progress/my_progress/', {
    headers: {
      'Authorization': `Bearer ${yourToken}`
    }
  });
  return response.json();
};
```

## Non-disruptive Design

The analytics system is designed to be non-disruptive to the existing application. This means:

1. Analytics tracking runs in parallel with core functionality
2. If analytics services fail, the main application continues to work
3. Analytics data is processed asynchronously to avoid performance impacts
4. User privacy is respected through clear data usage policies
