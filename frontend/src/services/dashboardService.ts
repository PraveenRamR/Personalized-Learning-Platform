import { api } from './apiClient';

// Define types locally to avoid circular dependencies
export interface LearningProgressData {
  contentCompleted: number;
  totalTimeSpent: number; // in minutes
  lastAccessDate: string;
  learningStreak: number;
  topSubjects: Array<{subject: string, count: number}>;
}

export interface RecommendationStats {
  totalRecommendations: number;
  likedRecommendations: number;
  viewedRecommendations: number;
  interactionRate: number;
}

export interface ActivityItem {
  id: string;
  type: 'view' | 'like' | 'complete' | 'comment' | 'goal_achieved';
  contentTitle?: string;
  contentId?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface GoalProgress {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: string;
  dueDate?: string;
}

export interface DashboardData {
  learningProgress: LearningProgressData;
  recommendationStats: RecommendationStats;
  recentActivity: ActivityItem[];
  goalProgress: GoalProgress[];
  goals: GoalProgress[];  // Added for backward compatibility
}

export const getUserDashboardData = async (
  token: string,
  period: 'day' | 'week' | 'month' | 'year' = 'week'
): Promise<DashboardData> => {
  try {
    // Use the API endpoint that our backend provides
    const response = await api.get(`/dashboard/?period=${period}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error: any) {
    console.error('Dashboard service error:', error);
    throw new Error(error.message || 'Failed to fetch dashboard data');
  }
};

export const updateUserGoal = async (
  token: string,
  goalId: string,
  goalData: {
    title?: string;
    target?: number;
    unit?: string;
    dueDate?: string;
  }
): Promise<any> => {
  try {
    const response = await api.patch(`/goals/${goalId}/`, goalData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error: any) {
    console.error('Goal update error:', error);
    throw new Error(error.message || 'Failed to update goal');
  }
};

export const createUserGoal = async (
  token: string,
  goalData: {
    title: string;
    target: number;
    unit: string;
    dueDate?: string;
  }
): Promise<any> => {
  try {
    const response = await api.post(`/goals/`, goalData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data;
  } catch (error: any) {
    console.error('Goal creation error:', error);
    throw new Error(error.message || 'Failed to create goal');
  }
};
