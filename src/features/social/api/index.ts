import { apiClient } from '@/shared/api';

// Минимальный Social API (пока не используется в интерфейсе)
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
}

// Social API Service (базовый)
export class SocialApiService {
  // Получить уведомления
  async getNotifications(): Promise<Notification[]> {
    const response = await apiClient.get<Notification[]>('/notifications');
    return response.data;
  }

  // Отметить уведомление как прочитанное
  async markNotificationAsRead(notificationId: string): Promise<void> {
    await apiClient.put(`/notifications/${notificationId}/read`);
  }

  // Отметить все уведомления как прочитанные
  async markAllNotificationsAsRead(): Promise<void> {
    await apiClient.put('/notifications/read-all');
  }
}

// Экспорт инстанса API
export const socialApi = new SocialApiService();
