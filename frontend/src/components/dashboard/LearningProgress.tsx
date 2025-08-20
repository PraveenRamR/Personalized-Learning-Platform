import React from 'react';
import { Card, Row, Col, ProgressBar } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import { getUserProgress } from '../../services/analyticsService';
import { useAuth } from '../../features/auth/AuthContext';

const LearningProgress: React.FC = () => {
  const { token } = useAuth();
  
  const { data: progress, isLoading, error } = useQuery({
    queryKey: ['userProgress'],
    queryFn: () => getUserProgress(token || ''),
    enabled: !!token,
    refetchOnWindowFocus: false,
    staleTime: 60000 // 1 minute
  });
  
  if (isLoading) {
    return (
      <Card>
        <Card.Body>
          <Card.Title>Your Learning Progress</Card.Title>
          <p>Loading progress data...</p>
        </Card.Body>
      </Card>
    );
  }
  
  if (error || !progress) {
    return (
      <Card>
        <Card.Body>
          <Card.Title>Your Learning Progress</Card.Title>
          <p>Unable to load progress data.</p>
        </Card.Body>
      </Card>
    );
  }
  
  // Calculate quiz completion rate
  const quizCompletionRate = progress.quizzes_attempted > 0
    ? Math.round((progress.quizzes_completed / progress.quizzes_attempted) * 100)
    : 0;
  
  // Format time spent
  const formatTimeSpent = (seconds: number) => {
    if (seconds < 60) return `${seconds} seconds`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    return `${hours} hours ${minutes % 60} minutes`;
  };
  
  return (
    <Card>
      <Card.Body>
        <Card.Title>Your Learning Progress</Card.Title>
        
        <div className="d-flex align-items-center mb-3">
          <div className="fs-1 me-3">🔥</div>
          <div>
            <h2 className="mb-0">{progress.learning_streak} day streak</h2>
            <p className="text-muted mb-0">Keep it going!</p>
          </div>
        </div>
        
        <Row className="g-3 mt-2">
          <Col md={6}>
            <div className="mb-3">
              <div className="d-flex justify-content-between mb-1">
                <span>Content Explored</span>
                <span className="fw-bold">{progress.total_content_viewed}</span>
              </div>
              <ProgressBar now={Math.min(100, progress.total_content_viewed / 2)} variant="info" />
            </div>
          </Col>
          
          <Col md={6}>
            <div className="mb-3">
              <div className="d-flex justify-content-between mb-1">
                <span>Quiz Completion</span>
                <span className="fw-bold">{quizCompletionRate}%</span>
              </div>
              <ProgressBar now={quizCompletionRate} variant="success" />
            </div>
          </Col>
        </Row>
        
        <div className="mt-3">
          <h5>Time Invested in Learning</h5>
          <p className="fs-4">{formatTimeSpent(progress.total_time_spent)}</p>
        </div>
        
        <div className="mt-3">
          <small className="text-muted">Last active: {new Date(progress.last_activity).toLocaleDateString()}</small>
        </div>
      </Card.Body>
    </Card>
  );
};

export default LearningProgress;
