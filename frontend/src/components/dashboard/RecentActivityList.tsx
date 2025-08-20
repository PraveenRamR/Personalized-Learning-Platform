import React from 'react';
import { ListGroup, Badge } from 'react-bootstrap';
import { ActivityItem } from '../../features/dashboard/DashboardContext';

interface RecentActivityListProps {
  activities: ActivityItem[];
}

const RecentActivityList: React.FC<RecentActivityListProps> = ({ activities }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'view':
        return '👁️';
      case 'like':
        return '👍';
      case 'complete':
        return '✅';
      case 'comment':
        return '💬';
      case 'goal_achieved':
        return '🏆';
      default:
        return '📝';
    }
  };

  const getActivityBadgeColor = (type: string) => {
    switch (type) {
      case 'view':
        return 'info';
      case 'like':
        return 'success';
      case 'complete':
        return 'primary';
      case 'comment':
        return 'secondary';
      case 'goal_achieved':
        return 'warning';
      default:
        return 'light';
    }
  };

  const getActivityDescription = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'view':
        return `Viewed "${activity.contentTitle}"`;
      case 'like':
        return `Liked "${activity.contentTitle}"`;
      case 'complete':
        return `Completed "${activity.contentTitle}"`;
      case 'comment':
        return `Commented on "${activity.contentTitle}"`;
      case 'goal_achieved':
        return `Achieved goal: ${activity.metadata?.goalTitle || 'Learning goal'}`;
      default:
        return 'Unknown activity';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / (1000 * 60));
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) {
      return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="recent-activity">
      {activities.length === 0 ? (
        <p className="text-muted text-center py-3">No recent activity recorded</p>
      ) : (
        <ListGroup variant="flush">
          {activities.map((activity) => (
            <ListGroup.Item key={activity.id} className="d-flex align-items-center">
              <Badge 
                bg={getActivityBadgeColor(activity.type)} 
                className="me-3 p-2"
                aria-hidden="true"
              >
                <span className="h5 mb-0">{getActivityIcon(activity.type)}</span>
              </Badge>
              <div className="flex-grow-1">
                <div>{getActivityDescription(activity)}</div>
                <small className="text-muted">{formatDate(activity.timestamp)}</small>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </div>
  );
};

export default RecentActivityList;
