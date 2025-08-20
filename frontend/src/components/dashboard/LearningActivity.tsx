import React from 'react';
import { Card } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import { getLearningStatus } from '../../services/analyticsService';
import { useAuth } from '../../features/auth/AuthContext';

interface ActivityDay {
  timestamp__date: string;
  count: number;
  time_spent: number;
}

const LearningActivity: React.FC = () => {
  const { token } = useAuth();
  
  const { data: learningData, isLoading, error } = useQuery({
    queryKey: ['learningActivity'],
    queryFn: () => getLearningStatus(token || ''),
    enabled: !!token,
    staleTime: 300000 // 5 minutes
  });
  
  if (isLoading) {
    return (
      <Card>
        <Card.Body>
          <Card.Title>Learning Activity</Card.Title>
          <p>Loading activity data...</p>
        </Card.Body>
      </Card>
    );
  }
  
  if (error || !learningData || !learningData.daily_activity) {
    return (
      <Card>
        <Card.Body>
          <Card.Title>Learning Activity</Card.Title>
          <p>Unable to load activity data or no activity recorded yet.</p>
        </Card.Body>
      </Card>
    );
  }
  
  // Get past 14 days for the activity calendar
  const getLast14Days = () => {
    const days = [];
    const now = new Date();
    
    for (let i = 13; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(now.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    
    return days;
  };
  
  const last14Days = getLast14Days();
  const activityMap = new Map<string, ActivityDay>();
  
  // Create map of activities
  learningData.daily_activity.forEach((day: ActivityDay) => {
    activityMap.set(day.timestamp__date, day);
  });
  
  const getActivityLevel = (date: string) => {
    const day = activityMap.get(date);
    if (!day) return 0;
    if (day.count < 3) return 1;
    if (day.count < 7) return 2;
    if (day.count < 12) return 3;
    return 4;
  };
  
  return (
    <Card>
      <Card.Body>
        <Card.Title>Learning Activity</Card.Title>
        
        <div className="d-flex flex-column mt-3">
          <div className="d-flex justify-content-between mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <span key={i} className="fw-bold text-center" style={{ width: '2rem' }}>{day}</span>
            ))}
          </div>
          
          <div className="activity-calendar">
            <div className="d-flex justify-content-between">
              {last14Days.map((date, i) => {
                const dayOfWeek = new Date(date).getDay();
                const activityLevel = getActivityLevel(date);
                
                const getActivityColor = (level: number) => {
                  if (level === 0) return '#ebedf0';
                  if (level === 1) return '#c6e48b';
                  if (level === 2) return '#7bc96f';
                  if (level === 3) return '#239a3b';
                  return '#196127';
                };
                
                return (
                  <div 
                    key={date} 
                    className="activity-day" 
                    style={{ 
                      width: '2rem',
                      height: '2rem',
                      backgroundColor: getActivityColor(activityLevel),
                      borderRadius: '4px',
                      position: 'relative'
                    }}
                    title={`${date}: ${activityMap.get(date)?.count || 0} activities`}
                  >
                    <div 
                      className="position-absolute top-0 start-50 translate-middle-x" 
                      style={{ fontSize: '0.7rem' }}
                    >
                      {new Date(date).getDate()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="mt-4 d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <span className="me-1">Less</span>
              {[0, 1, 2, 3, 4].map(level => {
                const getActivityColor = (level: number) => {
                  if (level === 0) return '#ebedf0';
                  if (level === 1) return '#c6e48b';
                  if (level === 2) return '#7bc96f';
                  if (level === 3) return '#239a3b';
                  return '#196127';
                };
                
                return (
                  <div 
                    key={level} 
                    style={{ 
                      width: '1rem',
                      height: '1rem',
                      backgroundColor: getActivityColor(level),
                      marginRight: '3px'
                    }}
                  />
                );
              })}
              <span className="ms-1">More</span>
            </div>
            
            <div>
              <small className="text-muted">
                Total events: {learningData.total_events || 0}
              </small>
            </div>
          </div>
        </div>
      </Card.Body>
    </Card>
  );
};

export default LearningActivity;
