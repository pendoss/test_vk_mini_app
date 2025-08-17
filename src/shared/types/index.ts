// Общие типы для приложения

export interface WorkoutPlan {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  estimatedDuration: number;
  friends: string[];
  afterWorkout: string;
  status: 'planned' | 'completed' | 'cancelled';
  createdAt: string;
  createdBy: string;
}

export interface User {
  id: string;
  name: string;
  avatar?: string;
  points: number;
  level: number;
  age?: number;
  height?: number;
  weight?: number;
  fitnessGoals?: string[];
  achievements?: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export interface Friend {
  id: string;
  name: string;
  level: number;
  points: number;
  city: string;
  gym: string;
  avatar?: string;
  isOnline: boolean;
  lastActivity: string;
  sharedWorkouts: number;
  mutualFriends: number;
  status: 'friend' | 'pending' | 'request';
}
