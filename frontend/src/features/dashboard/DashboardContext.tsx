import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '../auth/AuthContext';

// Define mock dashboard service function until the real one is available
const getUserDashboardData = async (token: string, period: string): Promise<any> => {
  console.log('Using mock dashboard data as dashboardService could not be imported');
  return getMockDashboardData();
};

// Provides mock data when API is not available
function getMockDashboardData(): DashboardData {
  return {
    learningProgress: {
      contentCompleted: 25,
      totalTimeSpent: 480, // 8 hours
      lastAccessDate: new Date().toISOString(),
      learningStreak: 7,
      topSubjects: [
        { subject: 'JavaScript', count: 8 },
        { subject: 'React', count: 7 },
        { subject: 'CSS', count: 5 }
      ]
    },
    recommendationStats: {
      totalRecommendations: 35,
      likedRecommendations: 18,
      viewedRecommendations: 12,
      interactionRate: 0.65
    },
    recentActivity: [
      { 
        id: '1', 
        timestamp: new Date().toISOString(), 
        type: 'complete', 
        contentTitle: 'React Hooks in Depth', 
        contentId: '2'
      },
      { 
        id: '2', 
        timestamp: new Date(Date.now() - 86400000).toISOString(), 
        type: 'view', 
        contentTitle: 'CSS Grid Masterclass', 
        contentId: '3'
      },
      { 
        id: '3', 
        timestamp: new Date(Date.now() - 172800000).toISOString(), 
        type: 'like', 
        contentTitle: 'TypeScript Generics', 
        contentId: '4'
      }
    ],
    goalProgress: [
      { 
        id: '1', 
        title: 'Complete React Course', 
        current: 65, 
        target: 100, 
        unit: 'percent', 
        dueDate: new Date(Date.now() + 604800000).toISOString() 
      },
      { 
        id: '2', 
        title: 'Learn TypeScript Basics', 
        current: 40, 
        target: 100, 
        unit: 'percent', 
        dueDate: new Date(Date.now() + 1209600000).toISOString() 
      },
      { 
        id: '3', 
        title: 'Build Portfolio Project', 
        current: 25, 
        target: 100, 
        unit: 'percent', 
        dueDate: new Date(Date.now() + 1814400000).toISOString() 
      }
    ],
    goals: [
      { 
        id: '1', 
        title: 'Complete React Course', 
        current: 65, 
        target: 100, 
        unit: 'percent', 
        dueDate: new Date(Date.now() + 604800000).toISOString() 
      },
      { 
        id: '2', 
        title: 'Learn TypeScript Basics', 
        current: 40, 
        target: 100, 
        unit: 'percent', 
        dueDate: new Date(Date.now() + 1209600000).toISOString() 
      },
      { 
        id: '3', 
        title: 'Build Portfolio Project', 
        current: 25, 
        target: 100, 
        unit: 'percent', 
        dueDate: new Date(Date.now() + 1814400000).toISOString() 
      }
    ]
  };
}

// Define the types locally since we're having trouble importing them
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

interface DashboardContextType {
  isLoading: boolean;
  error: string | null;
  dashboardData: DashboardData | null;
  refreshDashboard: () => void;
  setActivePeriod: (period: 'day' | 'week' | 'month' | 'year') => void;
  activePeriod: 'day' | 'week' | 'month' | 'year';
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const { token } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activePeriod, setActivePeriod] = useState<'day' | 'week' | 'month' | 'year'>('week');

  const fetchDashboardData = async () => {
    if (!token) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getUserDashboardData(token, activePeriod);
      setDashboardData(data);
      console.log('Dashboard data loaded successfully for period:', activePeriod);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [token, activePeriod]);

  const refreshDashboard = () => {
    fetchDashboardData();
  };

  const value = {
    isLoading,
    error,
    dashboardData,
    refreshDashboard,
    setActivePeriod,
    activePeriod
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
