import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import { LearningProgressData } from '../../features/dashboard/DashboardContext';

interface LearningProgressChartProps {
  learningData: LearningProgressData;
}

const LearningProgressChart: React.FC<LearningProgressChartProps> = ({ learningData }) => {
  const formatTimeSpent = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min${minutes !== 1 ? 's' : ''}`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    
    if (remainingMins === 0) {
      return `${hours} hr${hours !== 1 ? 's' : ''}`;
    }
    
    return `${hours} hr${hours !== 1 ? 's' : ''} ${remainingMins} min${remainingMins !== 1 ? 's' : ''}`;
  };

  const formatLastAccessed = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // If it's today
    if (date.toDateString() === now.toDateString()) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // If it's yesterday
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    
    // Otherwise show the full date
    return date.toLocaleDateString([], { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="learning-progress-chart">
      <Row className="mb-4">
        <Col sm={6} md={3} className="mb-3 mb-md-0">
          <Card className="text-center h-100">
            <Card.Body>
              <h2 className="mb-0">{learningData.contentCompleted}</h2>
              <div className="text-muted">Items Completed</div>
            </Card.Body>
          </Card>
        </Col>
        <Col sm={6} md={3} className="mb-3 mb-md-0">
          <Card className="text-center h-100">
            <Card.Body>
              <h2 className="mb-0">{formatTimeSpent(learningData.totalTimeSpent)}</h2>
              <div className="text-muted">Time Learning</div>
            </Card.Body>
          </Card>
        </Col>
        <Col sm={6} md={3} className="mb-3 mb-md-0">
          <Card className="text-center h-100">
            <Card.Body>
              <h2 className="mb-0">{learningData.learningStreak}</h2>
              <div className="text-muted">Day Streak</div>
            </Card.Body>
          </Card>
        </Col>
        <Col sm={6} md={3}>
          <Card className="text-center h-100">
            <Card.Body>
              <h6 className="text-muted mb-1">Last Access</h6>
              <div>{formatLastAccessed(learningData.lastAccessDate)}</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <div>
        <h6>Top Subjects</h6>
        <div className="d-flex flex-wrap">
          {learningData.topSubjects.length === 0 ? (
            <p className="text-muted">No subject data available</p>
          ) : (
            learningData.topSubjects.map((subject, index) => (
              <div key={subject.subject} className="me-3 mb-2">
                <span className={`badge bg-${index === 0 ? 'primary' : index === 1 ? 'success' : 'info'} p-2`}>
                  {subject.subject}: {subject.count}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningProgressChart;
