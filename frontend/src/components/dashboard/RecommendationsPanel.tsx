import React from 'react';
import { Card, ListGroup, Badge } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import { getPopularContent } from '../../services/analyticsService';
import { useAuth } from '../../features/auth/AuthContext';

interface PopularContentItem {
  id: number;
  content_item: number;
  content_title: string;
  view_count: number;
  completion_rate: number;
  avg_time_spent: number;
}

const RecommendationsPanel: React.FC = () => {
  const { token } = useAuth();
  
  const { data: popularContent, isLoading, error } = useQuery({
    queryKey: ['popularContent'],
    queryFn: () => getPopularContent(token || ''),
    enabled: !!token,
    staleTime: 600000 // 10 minutes
  });
  
  if (isLoading) {
    return (
      <Card>
        <Card.Body>
          <Card.Title>Trending Content</Card.Title>
          <p>Loading recommendations...</p>
        </Card.Body>
      </Card>
    );
  }
  
  if (error || !popularContent) {
    return (
      <Card>
        <Card.Body>
          <Card.Title>Trending Content</Card.Title>
          <p>Unable to load trending content.</p>
        </Card.Body>
      </Card>
    );
  }
  
  // Format time
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };
  
  return (
    <Card>
      <Card.Body>
        <Card.Title>Trending Content</Card.Title>
        <Card.Subtitle className="mb-2 text-muted">Popular among learners</Card.Subtitle>
        
        <ListGroup variant="flush" className="mt-3">
          {popularContent.map((item: PopularContentItem) => (
            <ListGroup.Item key={item.id} className="d-flex justify-content-between align-items-center">
              <div>
                <div className="fw-semibold">{item.content_title}</div>
                <small className="text-muted">
                  Avg. time: {formatTime(item.avg_time_spent)}
                </small>
              </div>
              <div className="d-flex align-items-center">
                <Badge bg="primary" pill className="me-2">
                  {Math.round(item.completion_rate)}% completion
                </Badge>
                <span className="text-muted">
                  <i className="bi bi-eye me-1"></i>
                  {item.view_count}
                </span>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
  );
};

export default RecommendationsPanel;
