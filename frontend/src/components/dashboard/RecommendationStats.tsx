import React from 'react';
import { Row, Col, ProgressBar } from 'react-bootstrap';
import { RecommendationStats as RecommendationStatsType } from '../../features/dashboard/DashboardContext';

interface RecommendationStatsProps {
  stats: RecommendationStatsType;
}

const RecommendationStats: React.FC<RecommendationStatsProps> = ({ stats }) => {
  // Calculate the engagement percentage - what portion of recommendations had some interaction
  const engagementRate = stats.totalRecommendations > 0 
    ? Math.round((stats.interactionRate) * 100) 
    : 0;

  // Calculate the like rate - what portion of viewed recommendations were liked
  const likeRate = stats.viewedRecommendations > 0 
    ? Math.round((stats.likedRecommendations / stats.viewedRecommendations) * 100) 
    : 0;
  
  return (
    <div className="recommendation-stats">
      <Row className="text-center mb-4">
        <Col xs={4}>
          <div className="h2 mb-0">{stats.totalRecommendations}</div>
          <div className="text-muted">Total</div>
        </Col>
        <Col xs={4}>
          <div className="h2 mb-0">{stats.viewedRecommendations}</div>
          <div className="text-muted">Viewed</div>
        </Col>
        <Col xs={4}>
          <div className="h2 mb-0">{stats.likedRecommendations}</div>
          <div className="text-muted">Liked</div>
        </Col>
      </Row>

      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <span>Engagement Rate</span>
          <span>{engagementRate}%</span>
        </div>
        <ProgressBar 
          now={engagementRate} 
          variant={engagementRate > 50 ? "success" : engagementRate > 25 ? "info" : "warning"}
        />
        <small className="text-muted">
          Percentage of recommendations you've interacted with
        </small>
      </div>

      <div>
        <div className="d-flex justify-content-between align-items-center mb-1">
          <span>Like Rate</span>
          <span>{likeRate}%</span>
        </div>
        <ProgressBar 
          now={likeRate} 
          variant={likeRate > 50 ? "success" : likeRate > 25 ? "info" : "warning"}
        />
        <small className="text-muted">
          Percentage of viewed recommendations you've liked
        </small>
      </div>
    </div>
  );
};

export default RecommendationStats;
