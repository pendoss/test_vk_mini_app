import { apiClient } from '@/shared/api';

// Типы на основе реально используемых данных в WorkoutPlannerPage и CalendarPage
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

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string; // markdown format
}

export interface Friend {
  id: string;
  name: string;
  nickname: string;
  status: 'online' | 'offline' | 'training';
}

export interface WorkoutInvitation {
  id: string;
  workoutId: string;
  workout: WorkoutPlan;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined';
  sentAt: string;
}

export interface CreateWorkoutRequest {
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  estimatedDuration: number;
  friends: string[];
  afterWorkout: string;
}

// Workout API Service
export class WorkoutApiService {
  // Получить все тренировки пользователя
  async getWorkouts(): Promise<WorkoutPlan[]> {
    const response = await apiClient.get<WorkoutPlan[]>('/workouts');
    return response.data;
  }

  // Получить тренировки для календаря (по датам)
  async getWorkoutsByDateRange(startDate: string, endDate: string): Promise<WorkoutPlan[]> {
    const response = await apiClient.get<WorkoutPlan[]>('/workouts/calendar', {
      params: { startDate, endDate }
    });
    return response.data;
  }

  // Получить тренировки на сегодня
  async getTodayWorkouts(): Promise<WorkoutPlan[]> {
    const today = new Date().toISOString().split('T')[0];
    const response = await apiClient.get<WorkoutPlan[]>('/workouts/today', {
      params: { date: today }
    });
    return response.data;
  }

  // Создать новую тренировку
  async createWorkout(workoutData: CreateWorkoutRequest): Promise<WorkoutPlan> {
    const response = await apiClient.post<WorkoutPlan>('/workouts', workoutData);
    return response.data;
  }

  // Обновить тренировку
  async updateWorkout(workoutId: string, updates: Partial<WorkoutPlan>): Promise<WorkoutPlan> {
    const response = await apiClient.put<WorkoutPlan>(`/workouts/${workoutId}`, updates);
    return response.data;
  }

  // Удалить тренировку
  async deleteWorkout(workoutId: string): Promise<void> {
    await apiClient.delete(`/workouts/${workoutId}`);
  }

  // Получить шаблоны тренировок
  async getWorkoutTemplates(): Promise<WorkoutTemplate[]> {
    const response = await apiClient.get<WorkoutTemplate[]>('/workouts/templates');
    return response.data;
  }

  // Получить друзей для приглашения
  async getFriendsForInvitation(): Promise<Friend[]> {
    const response = await apiClient.get<Friend[]>('/user/friends/for-invitation');
    return response.data;
  }

  // Отправить приглашение на тренировку
  async sendWorkoutInvitation(workoutId: string, friendId: string, message?: string): Promise<WorkoutInvitation> {
    const response = await apiClient.post<WorkoutInvitation>(`/workouts/${workoutId}/invite`, {
      friendId,
      message
    });
    return response.data;
  }

  // Получить приглашения пользователя
  async getWorkoutInvitations(): Promise<WorkoutInvitation[]> {
    const response = await apiClient.get<WorkoutInvitation[]>('/workout-invitations');
    return response.data;
  }

  // Ответить на приглашение
  async respondToInvitation(invitationId: string, action: 'accept' | 'decline'): Promise<WorkoutInvitation> {
    const response = await apiClient.put<WorkoutInvitation>(`/workout-invitations/${invitationId}`, {
      action
    });
    return response.data;
  }

  // Скопировать тренировку
  async copyWorkout(workoutId: string): Promise<WorkoutPlan> {
    const response = await apiClient.post<WorkoutPlan>(`/workouts/${workoutId}/copy`);
    return response.data;
  }

  // Отметить тренировку как выполненную
  async completeWorkout(workoutId: string): Promise<WorkoutPlan> {
    const response = await apiClient.put<WorkoutPlan>(`/workouts/${workoutId}/complete`);
    return response.data;
  }

  // Отменить тренировку
  async cancelWorkout(workoutId: string): Promise<WorkoutPlan> {
    const response = await apiClient.put<WorkoutPlan>(`/workouts/${workoutId}/cancel`);
    return response.data;
  }
}

// Экспорт инстанса API
export const workoutApi = new WorkoutApiService();
