import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import bridge from '@vkontakte/vk-bridge';

// API конфигурация
export const API_CONFIG = {
  baseURL: import.meta.env.MODE === 'production' 
    ? 'https://your-production-api.com/api/v1' 
    : 'http://localhost:3001/api/v1',
  timeout: 10000,
  withCredentials: true,
};

// API endpoints
export const API_ENDPOINTS = {
  // User endpoints
  USER_ME: '/user/me',
  USER_PROFILE: '/user/profile',
  USER_HOME: '/user/home',
  USER_ACTIVITY: '/user/activity',
  
  // Auth endpoints
  AUTH_VK: '/auth/vk',
  AUTH_REFRESH: '/auth/refresh',
  
  // Friends endpoints
  FRIENDS: '/user/friends',
  FRIEND_REQUESTS: '/user/friend-requests',
  USER_SEARCH: '/user/search',
  
  // Workouts endpoints
  WORKOUTS: '/workouts',
  WORKOUTS_TODAY: '/workouts/today',
  WORKOUTS_CALENDAR: '/workouts/calendar',
  WORKOUT_TEMPLATES: '/workouts/templates',
  WORKOUT_INVITATIONS: '/workout-invitations',
  
  // Tasks endpoints
  TASKS: '/tasks',
  TASKS_DAILY: '/tasks/daily',
  TASKS_WEEKLY: '/tasks/weekly',
  
  // Leaderboard endpoints
  LEADERBOARD: '/leaderboard',
  
  // Notifications endpoints
  NOTIFICATIONS: '/notifications',
} as const;

// Типы для API ошибок
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  message?: string;
}

// Создаем инстанс axios
const createApiClient = (): AxiosInstance => {
  const client = axios.create(API_CONFIG);

  // Request interceptor для добавления токенов
  client.interceptors.request.use(
    async (config) => {
      try {
        // Получаем VK токен для аутентификации
        const vkUser = await bridge.send('VKWebAppGetUserInfo');
        const launchParams = await bridge.send('VKWebAppGetLaunchParams');
        
        // Добавляем заголовки для VK Mini App
        if (config.headers) {
          (config.headers as any)['X-VK-User-ID'] = vkUser.id.toString();
          (config.headers as any)['X-VK-Platform'] = launchParams.vk_platform;
          (config.headers as any)['X-VK-Language'] = launchParams.vk_language || 'ru';
          (config.headers as any)['X-VK-App-ID'] = launchParams.vk_app_id;
          (config.headers as any)['Content-Type'] = 'application/json';
        }

        // Если есть access_token в параметрах запуска
        if (launchParams.vk_access_token_settings) {
          config.headers['Authorization'] = `Bearer ${launchParams.vk_access_token_settings}`;
        }

        return config;
      } catch (error) {
        console.warn('VK Bridge error in request interceptor:', error);
        return config;
      }
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor для обработки ошибок
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    async (error: AxiosError) => {
      const originalRequest = error.config;

      // Обработка ошибок аутентификации
      if (error.response?.status === 401 && originalRequest) {
        try {
          // Показываем уведомление пользователю
          console.warn('Authentication error, please re-login');
        } catch (bridgeError) {
          console.warn('VK Bridge error:', bridgeError);
        }
      }

      // Обработка сетевых ошибок
      if (!error.response) {
        console.error('Network error:', error.message);
        
        try {
          console.error('Network error, showing notification');
        } catch (bridgeError) {
          console.warn('VK Bridge error:', bridgeError);
        }
      }

      return Promise.reject(error);
    }
  );

  return client;
};

// Создаем и экспортируем API client
export const apiClient = createApiClient();

// Утилиты для работы с API ошибками
export const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.response?.status === 404) {
      return 'Ресурс не найден';
    }
    if (error.response?.status === 500) {
      return 'Внутренняя ошибка сервера';
    }
    if (error.response?.status === 403) {
      return 'Недостаточно прав доступа';
    }
    if (error.message) {
      return error.message;
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'Произошла неизвестная ошибка';
};

export const isApiError = (error: unknown): error is AxiosError => {
  return axios.isAxiosError(error);
};

// Типизированные методы API
export const createTypedApiMethod = <TRequest = any, TResponse = any>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string
) => {
  return async (data?: TRequest, config?: any): Promise<TResponse> => {
    const response = await apiClient.request<TResponse>({
      method,
      url: endpoint,
      ...(method === 'GET' ? { params: data } : { data }),
      ...config,
    });
    return response.data;
  };
};

// Экспорт всех утилит
export default apiClient;
