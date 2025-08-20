import React from 'react';
import { Card, ListGroup } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import { getUserProgress, getLearningStatus } from '../../services/analyticsService';
import { useAuth } from '../../features/auth/AuthContext';

/**
 * Component to display a snapshot of analytics data in other parts of the application
 */
const AnalyticsInsights: React.FC = () => {
  const { token } = useAuth();
  
  const { data: userProgress, isLoading: progressLoading } = useQuery({
    queryKey: ['userProgress'],
    queryFn: () => token ? getUserProgress(token) : null,
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const { data: learningStatus, isLoading: statusLoading } = useQuery({
    queryKey: ['learningStatus'],
    queryFn: () => token ? getLearningStatus(token) : null,
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  const isLoading = progressLoading || statusLoading;
  
  if (isLoading) {
    return (
      <Card className="mb-3">
        <Card.Header>Your Learning Insights</Card.Header>
        <Card.Body>
          <p className="text-center">Loading insights...</p>
        </Card.Body>
      </Card>
    );
  }
  
  // Format minutes into hours and minutes
  const formatTime = (minutes: number) => {
    if (!minutes) return '0 minutes';
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    
    return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
  };
  
  const getTopCategory = () => {
    if (!learningStatus || !learningStatus.top_categories || learningStatus.top_categories.length === 0) {
      return 'No categories yet';
    }
    
    return learningStatus.top_categories[0][0];
  };
  
  return (
    <Card className="mb-3">
      <Card.Header>Your Learning Insights</Card.Header>
      <ListGroup variant="flush">
        <ListGroup.Item>
          <div className="d-flex justify-content-between">
            <span>Content Viewed</span>
            <span className="text-primary">{userProgress?.total_content_viewed || 0}</span>
          </div>
        </ListGroup.Item>
        <ListGroup.Item>
          <div className="d-flex justify-content-between">
            <span>Time Spent Learning</span>
            <span className="text-primary">{formatTime((userProgress?.total_time_spent || 0) / 60)}</span>
          </div>
        </ListGroup.Item>
        <ListGroup.Item>
          <div className="d-flex justify-content-between">
            <span>Learning Streak</span>
            <span className="text-primary">{userProgress?.learning_streak || 0} days</span>
          </div>
        </ListGroup.Item>
        <ListGroup.Item>
          <div className="d-flex justify-content-between">
            <span>Top Category</span>
            <span className="text-primary">{getTopCategory()}</span>
          </div>
        </ListGroup.Item>
      </ListGroup>
  {/* Removed View Full Dashboard link for demo */}
    </Card>
  );
};

export default AnalyticsInsights;
