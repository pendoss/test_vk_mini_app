export interface User {
  id: string;
  vkId: number;
  firstName: string;
  lastName: string;
  avatar?: string;
  level: number;
  experience: number;
  experienceToNext: number;
  totalWorkouts: number;
  totalTime: number; // в минутах
  friends: string[];
  achievements: Achievement[];
  weeklyGoal: number;
  currentStreak: number;
  bestStreak: number;
  preferences: UserPreferences;
  createdAt?: string;
  updatedAt?: string;
  
  // Legacy поля для совместимости
  name?: string;
  points?: number;
  city?: string;
  birthDate?: string;
  nickname?: string;
}

export interface UserPreferences {
  notifications: boolean;
  privacy: 'public' | 'friends' | 'private';
  units: 'metric' | 'imperial';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
  category: 'workout' | 'streak' | 'social' | 'time' | 'special';
}

export interface UserStats {
  totalWorkouts: number;
  totalTime: number;
  averageWorkoutTime: number;
  weeklyWorkouts: number;
  monthlyWorkouts: number;
  currentStreak: number;
  bestStreak: number;
  favoriteWorkoutType: string;
  level: number;
  experience: number;
}

export interface CreateUserRequest {
  vkId: number;
  firstName: string;
  lastName: string;
  avatar?: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  weeklyGoal?: number;
  preferences?: Partial<UserPreferences>;
}

export interface LeaderboardEntry {
  user: User;
  value: number;
  rank: number;
}
