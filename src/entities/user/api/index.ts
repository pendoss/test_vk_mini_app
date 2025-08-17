import { apiClient } from '@/shared/api';

// Типы на основе реально используемых данных в интерфейсе
export interface User {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  points: number;
  level: number;
  avatar?: string;
  city?: string;
  birthDate?: string | null;
  sex?: 0 | 1 | 2; // VK API format
}

export interface UserProfile {
  fullName: string;
  birthDate: string | null;
  weight: number;
  city: string;
  primaryGym: string;
  records: Record<string, number>; // "Жим лежа": 120
  upcomingWorkouts: WorkoutPlan[];
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  points: number;
  level: number;
  rank: number;
  change: number; // -1, 0, 1 для изменения позиции
  city: string;
  gym: string;
  todayPoints: number;
  weekPoints: number;
  avatar?: string;
}

export interface Friend {
  id: string;
  name: string;
  level: number;
  points: number;
  city: string;
  gym: string;
  status: 'online' | 'offline' | 'training';
  lastWorkout: string;
  totalWorkouts: number;
  friendsSince: string;
  mutualFriends: number;
}

export interface FriendRequest {
  id: string;
  name: string;
  level: number;
  city: string;
  gym: string;
  sentAt: string;
  mutualFriends: number;
  type: 'incoming' | 'outgoing';
}

export interface SearchResult {
  id: string;
  name: string;
  level: number;
  city: string;
  gym: string;
  mutualFriends: number;
  status: 'not_friend' | 'request_sent' | 'request_received' | 'friend';
}

export interface WorkoutPlan {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD format
  time: string; // HH:MM format
  location: string;
  estimatedDuration: number; // in minutes
  friends: string[]; // friend names or IDs
  afterWorkout: string;
  status: 'planned' | 'completed' | 'cancelled';
  createdAt: string;
  createdBy: string;
}

export interface UserActivity {
  workoutsCompleted: number;
  friendsAdded: number;
  workoutsPlanned: number;
  workoutsWithFriends: number;
  dailyPoints: number;
  totalWorkouts: number;
}

// Additional request types
export interface CreateUserRequest {
  firstName: string;
  lastName: string;
  birthDate?: string;
  city?: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  city?: string;
  weight?: number;
  primaryGym?: string;
}

export interface LeaderboardParams {
  limit?: number;
  offset?: number;
  timeframe?: 'week' | 'month' | 'all';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  detailedDescription: string;
  difficulty: 'легкий' | 'средний' | 'тяжелый' | 'невозможный';
  points: number;
  timeRemaining: string;
  progress: number; // 0-100
  maxProgress: number;
  completed: boolean;
  category: string;
  type: 'automatic' | 'manual';
  triggerAction?: string;
  icon: string; // icon name
}

export interface HomeData {
  user: {
    level: number;
    points: number;
  };
  todayWorkouts: WorkoutPlan[];
}

// User API Service
export class UserApiService {
  // Получить данные для главной страницы
  async getHomeData(): Promise<HomeData> {
    const response = await apiClient.get<HomeData>('/user/home');
    return response.data;
  }

  // Получить текущего пользователя
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/user/me');
    return response.data;
  }

  // Получить профиль пользователя
  async getUserProfile(userId?: string): Promise<UserProfile> {
    const endpoint = userId ? `/user/${userId}/profile` : '/user/profile';
    const response = await apiClient.get<UserProfile>(endpoint);
    return response.data;
  }

  // Обновить профиль
  async updateProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
    const response = await apiClient.put<UserProfile>('/user/profile', profileData);
    return response.data;
  }

  // Получить лидерборд
  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    const response = await apiClient.get<LeaderboardEntry[]>('/leaderboard');
    return response.data;
  }

  // Получить друзей
  async getFriends(): Promise<Friend[]> {
    const response = await apiClient.get<Friend[]>('/user/friends');
    return response.data;
  }

  // Получить заявки в друзья
  async getFriendRequests(): Promise<FriendRequest[]> {
    const response = await apiClient.get<FriendRequest[]>('/user/friend-requests');
    return response.data;
  }

  // Поиск пользователей
  async searchUsers(query: string): Promise<SearchResult[]> {
    const response = await apiClient.get<SearchResult[]>('/user/search', {
      params: { q: query }
    });
    return response.data;
  }

  // Отправить заявку в друзья
  async sendFriendRequest(userId: string): Promise<void> {
    await apiClient.post(`/user/friend-request/${userId}`);
  }

  // Принять заявку в друзья
  async acceptFriendRequest(requestId: string): Promise<void> {
    await apiClient.post(`/user/friend-request/${requestId}/accept`);
  }

  // Отклонить заявку в друзья
  async declineFriendRequest(requestId: string): Promise<void> {
    await apiClient.post(`/user/friend-request/${requestId}/decline`);
  }

  // Удалить из друзей
  async removeFriend(friendId: string): Promise<void> {
    await apiClient.delete(`/user/friend/${friendId}`);
  }

  // Получить активность пользователя
  async getUserActivity(): Promise<UserActivity> {
    const response = await apiClient.get<UserActivity>('/user/activity');
    return response.data;
  }
}

// Экспорт инстанса API
export const userApi = new UserApiService();
