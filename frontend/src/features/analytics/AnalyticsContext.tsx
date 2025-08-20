import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useAuth } from '../auth/AuthContext';
import { trackEvent as trackAnalyticsEvent } from '../../services/analyticsService';

export interface AnalyticsContextType {
  trackContentView: (contentId: string | number, metadata?: Record<string, any>) => void;
  trackContentComplete: (contentId: string | number, duration: number, metadata?: Record<string, any>) => void;
  trackQuizAttempt: (contentId: string | number, metadata?: Record<string, any>) => void;
  trackQuizComplete: (contentId: string | number, score: number, metadata?: Record<string, any>) => void;
  trackSearchPerformed: (query: string, resultCount: number) => void;
  trackPageView: (pageName: string, metadata?: Record<string, any>) => void;
  trackTimeSpent: (contentId: string | number, seconds: number) => void;
  trackEvent: (eventType: string, eventData?: Record<string, any>) => void;
}

export const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

interface AnalyticsProviderProps {
  children: ReactNode;
}

export const AnalyticsProvider = ({ children }: AnalyticsProviderProps) => {
  const { token, user } = useAuth();
  const isAuthenticated = !!user;
  
  const logEvent = useCallback((eventType: string, contentId: string | number | null, metadata: Record<string, any> = {}) => {
    if (!isAuthenticated || !token) return;
    
    const eventData = {
      event_type: eventType,
      content_item: contentId,
      metadata
    };
    
    // Track event in the background without blocking user interaction
    try {
      trackAnalyticsEvent(token, eventData);
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
      
  }, [isAuthenticated, token]);
  
  // Tracking functions that don't disrupt existing app behavior
  const trackContentView = useCallback((contentId: string | number, metadata = {}) => {
    logEvent('view', contentId, metadata);
  }, [logEvent]);
  
  const trackContentComplete = useCallback((contentId: string | number, duration: number, metadata = {}) => {
    logEvent('complete', contentId, { ...metadata, duration });
  }, [logEvent]);
  
  const trackQuizAttempt = useCallback((contentId: string | number, metadata = {}) => {
    logEvent('quiz_attempt', contentId, metadata);
  }, [logEvent]);
  
  const trackQuizComplete = useCallback((contentId: string | number, score: number, metadata = {}) => {
    logEvent('quiz_complete', contentId, { ...metadata, score });
  }, [logEvent]);
  
  const trackSearchPerformed = useCallback((query: string, resultCount: number) => {
    logEvent('search', null, { query, resultCount });
  }, [logEvent]);
  
  const trackPageView = useCallback((pageName: string, metadata = {}) => {
    logEvent('view', null, { ...metadata, pageName });
  }, [logEvent]);
  
  const trackTimeSpent = useCallback((contentId: string | number, seconds: number) => {
    logEvent('view', contentId, { duration: seconds, timeTracking: true });
  }, [logEvent]);
  
  const trackEvent = useCallback((eventType: string, eventData: Record<string, any> = {}) => {
    logEvent(eventType, null, eventData);
  }, [logEvent]);

  const value = {
    trackContentView,
    trackContentComplete,
    trackQuizAttempt,
    trackQuizComplete,
    trackSearchPerformed,
    trackPageView,
    trackTimeSpent,
    trackEvent
  };
  
  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};
