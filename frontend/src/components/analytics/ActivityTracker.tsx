import React, { useEffect, useRef } from 'react';
import { useAnalytics } from '../../features/analytics/AnalyticsContext';

interface ActivityTrackerProps {
  contentId?: string | number;
  pageId: string;
  title?: string;
}

/**
 * Component to track user activity on a page or content item
 * This is a non-visible component that only handles analytics tracking
 */
const ActivityTracker: React.FC<ActivityTrackerProps> = ({ contentId, pageId, title }) => {
  const { trackEvent, trackPageView } = useAnalytics();
  const timeOnPageStart = useRef(Date.now());
  
  // Track page view on mount
  useEffect(() => {
    try {
      if (contentId) {
        // Track content view
  trackEvent('view', { content_id: String(contentId), title, page: pageId });
      } else {
        trackPageView(pageId, { title });
      }
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
    
    // Reset time counter
    timeOnPageStart.current = Date.now();
    
    // When component unmounts, calculate time spent
    return () => {
      const timeSpentMs = Date.now() - timeOnPageStart.current;
      const timeSpentSeconds = Math.floor(timeSpentMs / 1000);
      
      // Only log if user spent at least 5 seconds on the page
      if (timeSpentSeconds >= 5) {
        // You could track this with another analytics event
        console.log(`User spent ${timeSpentSeconds} seconds on ${pageId}`);
      }
    };
  }, [contentId, pageId, title, trackEvent, trackPageView]);
  
  return null; // This component doesn't render anything
};

export default ActivityTracker;
