import React, { useState } from 'react';
import { Card, ListGroup, Badge, Button, Spinner } from 'react-bootstrap';
import { api } from '../../services/apiClient';
import { useQuery } from '@tanstack/react-query';
import { getPersonalizedRecommendations } from '../../services/analyticsService';
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
  const [refreshing, setRefreshing] = useState(false);
  const [localRecommendations, setLocalRecommendations] = useState<any[]>([]);
  const { data: recommendations, isLoading, error, refetch } = useQuery({
    queryKey: ['personalizedRecommendations'],
    queryFn: () => getPersonalizedRecommendations(token || ''),
    enabled: !!token,
    staleTime: 0 // Always refetch after refresh
    // On success, update local state
  });

  React.useEffect(() => {
    if (recommendations) {
      setLocalRecommendations(recommendations);
    }
  }, [recommendations]);

  const handleDislike = async (id: number) => {
    try {
      await api.post('interactions/', {
        content_item: id,
        action: 'disliked',
      });
      setLocalRecommendations((prev) => prev.filter((item: any) => item.id !== id));
      // Refetch from backend to ensure SVD and backend filtering
      setTimeout(() => {
        refetch();
      }, 500);
    } catch (err) {
      alert('Failed to dislike content.');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await api.post('recommendations/refresh/');
      // Wait for Celery to process (e.g., 2 seconds), then refetch
      setTimeout(() => {
        refetch();
        setRefreshing(false);
      }, 2000);
    } catch (err) {
      setRefreshing(false);
      alert('Failed to refresh recommendations.');
    }
  };
  
  if (isLoading) {
    return (
      <Card>
        <Card.Body>
          <Card.Title>Personalized Recommendations</Card.Title>
          <p>Loading recommendations...</p>
        </Card.Body>
      </Card>
    );
  }

  if (error || !localRecommendations) {
    return (
      <Card>
        <Card.Body>
          <Card.Title>Personalized Recommendations</Card.Title>
          <p>Unable to load recommendations.</p>
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
      <Card.Body style={{ position: 'relative', minHeight: 80 }}>
        <Card.Title className="mb-0" style={{ paddingRight: 120 }}>Personalized Recommendations</Card.Title>
        <Button
          style={{ position: 'absolute', right: 24, top: 16, zIndex: 2 }}
          variant="outline-primary"
          onClick={handleRefresh}
          disabled={refreshing || isLoading}
        >
          {refreshing ? <Spinner size="sm" animation="border" className="me-2" /> : <span className="me-2">↻</span>}
          Refresh
        </Button>
        <div style={{ marginTop: 8 }}>
          <Card.Subtitle className="mb-2 text-muted">Showing recommendations by priority: <span className="badge bg-primary">Interests</span> <span className="badge bg-success">Likes</span> <span className="badge bg-info">Views</span></Card.Subtitle>
          <small className="text-muted">disliked content is excluded from recommendations</small>
        </div>
        <ListGroup variant="flush" className="mt-3">
          {localRecommendations.map((item: any) => (
            <ListGroup.Item key={item.id} className="d-flex justify-content-between align-items-center">
              <div>
                <div className="fw-semibold">{item.title}</div>
                <div>{item.description}</div>
                <div><span className="text-muted">Type: {item.type}</span></div>
                <div>
                  Other tags: {item.tags && item.tags.map((tag: string) => (
                    <span key={tag} className="badge bg-secondary me-1">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="d-flex align-items-center">
                <Button variant="outline-primary" size="sm" className="me-2">View</Button>
                <Button variant="outline-success" size="sm" className="me-2">👍 Like</Button>
                <Button variant="outline-danger" size="sm" onClick={() => handleDislike(item.id)}>👎 Dislike</Button>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
  );
};

export default RecommendationsPanel;
