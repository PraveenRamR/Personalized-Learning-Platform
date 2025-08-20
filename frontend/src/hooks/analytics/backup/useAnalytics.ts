import React, { useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalytics as useFeatureAnalytics, AnalyticsContext, AnalyticsContextType } from '../../features/analytics/AnalyticsContext';
/**
 * Hook for tracking page views and other analytics events
 * This is a wrapper around the analytics context to provide a consistent API
 */
export const useAnalytics = () => {
  const analytics = useFeatureAnalytics();
  const location = useLocation();

  // Track page view on route change
  useEffect(() => {
    if (location) { // Only track if location is available
      analytics.trackPageView({
        path: location.pathname,
        query: new URLSearchParams(location.search).toString()
      });
    }
  }, [location?.pathname, location?.search]);
  
  // Helper methods for various tracking actions
  const trackContentView = (contentId: string | number, metadata?: Record<string, any>) => {
  analytics.trackEvent('view', {
      content_id: contentId,
      ...metadata
    });
  };

  const trackContentComplete = (contentId: string | number, duration: number, metadata?: Record<string, any>) => {
    analytics.trackEvent('complete', {
      content_id: contentId,
      duration,
      ...metadata
    });
  };

  const trackQuizAttempt = (contentId: string | number, metadata?: Record<string, any>) => {
    analytics.trackEvent('quiz_attempt', {
      content_id: contentId,
      ...metadata
    });
  };

  const trackQuizComplete = (contentId: string | number, score: number, metadata?: Record<string, any>) => {
    analytics.trackEvent('quiz_complete', {
      content_id: contentId,
      score,
      ...metadata
    });
  };

  const trackSearchPerformed = (query: string, resultCount: number) => {
    analytics.trackEvent('search', {
      query,
      result_count: resultCount
    });
  };

  // Remove trackTimeSpent, not a valid event_type for backend

  // Enhanced trackPageView that accepts either a string or an object
  const trackPageView = (pageNameOrData: string | any, metadata?: Record<string, any>) => {
    if (typeof pageNameOrData === 'string') {
      analytics.trackPageView({
        path: pageNameOrData,
        title: pageNameOrData,
        ...metadata
      });
    } else {
      analytics.trackPageView(pageNameOrData);
    }
  };

  return {
    ...analytics,
    trackContentView,
    trackContentComplete,
    trackQuizAttempt,
    trackQuizComplete,
    trackSearchPerformed,
  // trackTimeSpent removed, not supported by backend
    trackPageView
  };
};

/**
 * Hook for tracking component usage
 * @param {string} componentName - The name of the component
 */
export const useComponentTracking = (componentName: string) => {
  const { trackEvent } = useContext(AnalyticsContext) as AnalyticsContextType;

  // Track component mount
  useEffect(() => {
    trackEvent('view', {
      component_name: componentName,
      action: 'mount'
    });

    return () => {
      trackEvent('view', {
        component_name: componentName,
        action: 'unmount'
      });
    };
  }, []);

  const trackComponentEvent = (action: string, data: Record<string, any> = {}) => {
    trackEvent('recommendation_click', {
      component_name: componentName,
      action,
      ...data
    });
  };

  return {
    trackComponentEvent
  };
};

/**
 * Hook for tracking form interactions
 */
export const useFormTracking = (formName: string) => {
  const { trackEvent } = useContext(AnalyticsContext) as AnalyticsContextType;

  // Remove form tracking events, not supported by backend event_type

  // No form tracking events are supported by backend, return empty object
  return {};
};
