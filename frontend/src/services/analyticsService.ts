// Get personalized recommendations for the user
export const getPersonalizedRecommendations = async (token: string) => {
  try {
    const response = await api.get(
      'recommendations/personalized/',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data.results;
  } catch (error) {
    console.error('Error fetching personalized recommendations:', error);
    throw error;
  }
};
import { api } from './apiClient';

interface AnalyticsEventData {
  event_type: string;
  content_item?: string | number | null;
  duration?: number;
  metadata?: Record<string, any>;
}

interface ProgressData {
  total_content_viewed: number;
  total_time_spent: number;
  quizzes_attempted: number;
  quizzes_completed: number;
  learning_streak: number;
  topic_progress: Record<string, number>;
}

// Track a user event without disrupting the main application flow
export const trackEvent = async (token: string, eventData: AnalyticsEventData) => {
  try {
    // Validate event_type before sending
    const allowedEventTypes = [
      'view', 'start', 'complete', 'quiz_attempt', 'quiz_complete', 'search', 'recommendation_click'
    ];
    if (!allowedEventTypes.includes(eventData.event_type)) {
      console.error(`Invalid event_type: ${eventData.event_type}. Must be one of: ${allowedEventTypes.join(', ')}`);
      return null;
    }
    const response = await api.post(
      'analytics/events/track/',
      eventData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    // Just log the error but don't disrupt the application
    console.error('Error tracking analytics event:', error);
    return null;
  }
};

// Get user progress information
export const getUserProgress = async (token: string) => {
  try {
    const response = await api.get(
      '/analytics/progress/my_progress/',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching user progress:', error);
    throw error;
  }
};

// Get user learning summary
export const getLearningStatus = async (token: string) => {
  try {
    const response = await api.get(
      '/analytics/progress/learning_summary/',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching learning summary:', error);
    throw error;
  }
};

// Get popular content based on analytics
export const getPopularContent = async (token: string) => {
  try {
    const response = await api.get(
      '/analytics/content-metrics/popular_content/',
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching popular content:', error);
    throw error;
  }
};

/**
 * Sample API usage for tracking learning events
 * This demonstrates how to track various user activities
 */
export const trackLearningEvent = async (token: string, contentId: string | number, eventType: string, metadata: Record<string, any> = {}) => {
  try {
    const response = await api.post('/analytics/events/', 
      {
        event_type: eventType,
        content_item: contentId,
        metadata: metadata
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error tracking learning event:', error);
    // We return null instead of throwing so this doesn't disrupt the app
    return null;
  }
};

// Fetch analytics dashboard data
export const fetchAnalyticsDashboard = async (period: string) => {
  // You may need to adjust the endpoint to match your backend
  const response = await api.get(`/analytics/dashboard/?period=${period}`);
  return response.data;
};
