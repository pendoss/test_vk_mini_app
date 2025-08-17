import { apiClient } from '@/shared/api';

// Типы на основе реально используемых данных в TasksPage
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
  triggerAction?: string; // what action triggers this task
  icon: string; // icon name for lucide-react
}

export interface UserActivity {
  workoutsCompleted: number;
  friendsAdded: number;
  workoutsPlanned: number;
  workoutsWithFriends: number;
  dailyPoints: number;
  totalWorkouts: number;
}

export interface TaskCompletion {
  task: Task;
  pointsEarned: number;
  experienceEarned: number;
  levelUp?: {
    oldLevel: number;
    newLevel: number;
  };
  newAchievements?: string[];
}

// Tasks API Service
export class TasksApiService {
  // Получить все задачи пользователя
  async getTasks(): Promise<Task[]> {
    const response = await apiClient.get<Task[]>('/tasks');
    return response.data;
  }

  // Получить активность пользователя
  async getUserActivity(): Promise<UserActivity> {
    const response = await apiClient.get<UserActivity>('/user/activity');
    return response.data;
  }

  // Обновить прогресс задачи (для automatic tasks)
  async updateTaskProgress(taskId: string, progress: number): Promise<Task> {
    const response = await apiClient.put<Task>(`/tasks/${taskId}/progress`, {
      progress
    });
    return response.data;
  }

  // Завершить задачу (для manual tasks)
  async completeTask(taskId: string): Promise<TaskCompletion> {
    const response = await apiClient.post<TaskCompletion>(`/tasks/${taskId}/complete`);
    return response.data;
  }

  // Получить ежедневные задачи
  async getDailyTasks(): Promise<Task[]> {
    const response = await apiClient.get<Task[]>('/tasks/daily');
    return response.data;
  }

  // Получить недельные задачи
  async getWeeklyTasks(): Promise<Task[]> {
    const response = await apiClient.get<Task[]>('/tasks/weekly');
    return response.data;
  }

  // Обновить активность пользователя (для automatic task triggers)
  async updateUserActivity(activity: Partial<UserActivity>): Promise<UserActivity> {
    const response = await apiClient.put<UserActivity>('/user/activity', activity);
    return response.data;
  }

  // Проверить триггеры для automatic tasks
  async checkTaskTriggers(): Promise<Task[]> {
    const response = await apiClient.post<Task[]>('/tasks/check-triggers');
    return response.data;
  }
}

// Экспорт инстанса API
export const tasksApi = new TasksApiService();
