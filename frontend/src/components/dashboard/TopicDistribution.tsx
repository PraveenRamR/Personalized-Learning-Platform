import React from 'react';
import { Card } from 'react-bootstrap';
import { useQuery } from '@tanstack/react-query';
import { getLearningStatus } from '../../services/analyticsService';
import { useAuth } from '../../features/auth/AuthContext';

const TopicDistribution: React.FC = () => {
  const { token } = useAuth();
  
  const { data: learningData, isLoading, error } = useQuery({
    queryKey: ['learningStatus'],
    queryFn: () => getLearningStatus(token || ''),
    enabled: !!token,
    staleTime: 300000 // 5 minutes
  });
  
  if (isLoading) {
    return (
      <Card>
        <Card.Body>
          <Card.Title>Your Learning Topics</Card.Title>
          <p>Loading topic data...</p>
        </Card.Body>
      </Card>
    );
  }
  
  if (error || !learningData || !learningData.top_categories) {
    return (
      <Card>
        <Card.Body>
          <Card.Title>Your Learning Topics</Card.Title>
          <p>Unable to load topic data or no topics available yet.</p>
        </Card.Body>
      </Card>
    );
  }
  
  // Get total count for percentage calculation
  const totalTopicsCount = learningData.top_categories.reduce((sum: number, [_, count]: [string, number]) => sum + count, 0);
  
  return (
    <Card>
      <Card.Body>
        <Card.Title>Your Learning Topics</Card.Title>
        
        {learningData.top_categories.length > 0 ? (
          <div className="mt-3">
            {learningData.top_categories.map(([topic, count]: [string, number], index: number) => {
              const percentage = totalTopicsCount > 0 ? Math.round((count / totalTopicsCount) * 100) : 0;
              const getTopicColor = (index: number) => {
                const colors = ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b'];
                return colors[index % colors.length];
              };
              
              return (
                <div key={topic} className="mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span>{topic}</span>
                    <span>{percentage}%</span>
                  </div>
                  <div className="progress" style={{ height: '20px' }}>
                    <div 
                      className="progress-bar" 
                      role="progressbar" 
                      style={{ 
                        width: `${percentage}%`,
                        backgroundColor: getTopicColor(index)
                      }}
                      aria-valuenow={percentage}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center mt-4">
            <p className="mb-0">Explore more content to see your topic distribution!</p>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default TopicDistribution;
