export interface User {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  level: number;
  avatar?: string;
  city?: string;
  birthDate?: string | null;
  sex?: 0 | 1 | 2; // VK API format
  status: "online" | "offline" | "training";
  workoutsCompleted: number;
  workoutsPlaned: number;
  workoutsWithFriends: number;
  totalWorkouts: number;
  friendAdded: number;
  weight: number;
  primaryGym: string;
  records: string[];
  points: number;
}

// export interface UserPreferences {
//   notifications: boolean;
//   privacy: 'public' | 'friends' | 'private';
//   units: 'metric' | 'imperial';
// }
//
// export interface Achievement {
//   id: string;
//   title: string;
//   description: string;
//   icon: string;
//   unlockedAt: string;
//   category: 'workout' | 'streak' | 'social' | 'time' | 'special';
// }
//
// export interface UserStats {
//   totalWorkouts: number;
//   totalTime: number;
//   averageWorkoutTime: number;
//   weeklyWorkouts: number;
//   monthlyWorkouts: number;
//   currentStreak: number;
//   bestStreak: number;
//   favoriteWorkoutType: string;
//   level: number;
//   experience: number;
// }
//
// export interface CreateUserRequest {
//   vkId: number;
//   firstName: string;
//   lastName: string;
//   avatar?: string;
// }
//
// export interface UpdateUserRequest {
//   firstName?: string;
//   lastName?: string;
//   avatar?: string;
//   weeklyGoal?: number;
//   preferences?: Partial<UserPreferences>;
// }
//
// export interface LeaderboardEntry {
//   user: User;
//   value: number;
//   rank: number;
// }
