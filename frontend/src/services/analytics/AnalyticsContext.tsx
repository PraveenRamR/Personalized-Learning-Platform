import React, { createContext, useState, useEffect, useCallback } from 'react';
import { api } from '../../api';

// Define types for our context
export interface AnalyticsContextType {
  trackEvent: (eventType: string, eventData?: Record<string, any>) => void;
  trackPageView: (pageData: PageViewData) => void;
  analyticsData: AnalyticsData | null;
  isLoading: boolean;
  error: string | null;
  fetchAnalyticsData: (period?: string) => Promise<void>;
}

export interface PageViewData {
  path: string;
  params?: Record<string, any>;
  query?: string;
  title?: string;
}

export interface AnalyticsData {
  userActivity: UserActivity;
  contentEngagement: ContentEngagement;
  learningProgress: LearningProgress;
}

export interface UserActivity {
  logins: number;
  contentViews: number;
  searches: number;
  timeSpent: number;
  activeUsers: number;
}

export interface ContentEngagement {
  mostViewedContent: ContentStat[];
  averageCompletionRate: number;
  totalInteractions: number;
  popularContentTypes: { type: string; count: number }[];
}

export interface LearningProgress {
  averageProgress: number;
  completedContents: number;
  inProgressContents: number;
  notStartedContents: number;
}

export interface ContentStat {
  id: number;
  title: string;
  contentType: string;
  viewCount: number;
}

// Create the context with default values
export const AnalyticsContext = createContext<AnalyticsContextType>({
  trackEvent: () => {},
  trackPageView: () => {},
  analyticsData: null,
  isLoading: false,
  error: null,
  fetchAnalyticsData: async () => {},
});

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Queue to store events when offline
  const [offlineEvents, setOfflineEvents] = useState<Array<{eventType: string, eventData: any}>>([]);
  
  // Track an event
  const trackEvent = useCallback((eventType: string, eventData: Record<string, any> = {}) => {
    // Add common data
    const eventWithMeta = {
      ...eventData,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };
    
    // Try to send the event to the server
    if (navigator.onLine) {
      api.post('/api/analytics/events/', { event_type: eventType, event_data: eventWithMeta })
        .catch((error: unknown) => {
          console.error('Failed to track event, storing offline:', error);
          // Store in offline queue if sending fails
          setOfflineEvents(prev => [...prev, { eventType, eventData: eventWithMeta }]);
        });
    } else {
      // Store in offline queue
      setOfflineEvents(prev => [...prev, { eventType, eventData: eventWithMeta }]);
    }
  }, []);
  
  // Track page view
  const trackPageView = useCallback((pageData: PageViewData) => {
    trackEvent('page_view', pageData);
  }, [trackEvent]);
  
  // Fetch analytics data from the API
  const fetchAnalyticsData = useCallback(async (period: string = 'week') => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await api.get(`/api/dashboard/analytics/?period=${period}`);
      setAnalyticsData(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
      setError('Failed to fetch analytics data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Send offline events when coming back online
  useEffect(() => {
    const handleOnline = async () => {
      if (offlineEvents.length > 0) {
        const eventsToSend = [...offlineEvents];
        setOfflineEvents([]);
        
        for (const event of eventsToSend) {
          try {
            await api.post('/api/analytics/events/', {
              event_type: event.eventType,
              event_data: event.eventData
            });
          } catch (error) {
            console.error('Failed to send offline event:', error);
            // Add back to queue if still failing
            setOfflineEvents(prev => [...prev, event]);
          }
        }
      }
    };
    
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [offlineEvents]);
  
  // Value to be provided by the context
  const value = {
    trackEvent,
    trackPageView,
    analyticsData,
    isLoading,
    error,
    fetchAnalyticsData
  };
  
  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};
