/**
 * Конфигурация приложения для FSD архитектуры
 * 
 * Этот файл содержит настройки для интеграции всех слоев приложения:
 * - API конфигурация
 * - Настройки сторов
 * - Константы приложения
 */

// API конфигурация
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

// Настройки для приложения
export const APP_CONFIG = {
  APP_NAME: 'TrainSync',
  VERSION: '1.0.0',
  ENVIRONMENT: import.meta.env.MODE || 'development',
  
  // Настройки для MobX
  MOBX_CONFIG: {
    enforceActions: 'never' as const,
    computedRequiresReaction: false,
    reactionRequiresObservable: false,
    observableRequiresReaction: false,
    disableErrorBoundaries: true,
  },
  
  // Настройки для уведомлений
  NOTIFICATIONS: {
    DEFAULT_DURATION: 3000,
    SUCCESS_DURATION: 2000,
    ERROR_DURATION: 5000,
  },
  
  // Настройки для тренировок
  WORKOUT: {
    DEFAULT_REST_TIME: 60, // секунды
    MAX_EXERCISES_PER_WORKOUT: 20,
    MIN_WORKOUT_DURATION: 5, // минуты
    MAX_WORKOUT_DURATION: 180, // минуты
  },
  
  // Настройки для пользователей
  USER: {
    EXPERIENCE_PER_LEVEL: 500,
    DEFAULT_WEEKLY_GOAL: 5,
    MAX_FRIENDS: 100,
  },
  
  // Настройки для социальных функций
  SOCIAL: {
    MAX_POST_LENGTH: 500,
    MAX_COMMENT_LENGTH: 200,
    POSTS_PER_PAGE: 20,
  },
};

// Константы для типов тренировок
export const WORKOUT_CATEGORIES = {
  STRENGTH: 'strength',
  CARDIO: 'cardio',
  FLEXIBILITY: 'flexibility',
  MIXED: 'mixed',
  SPORTS: 'sports',
} as const;

// Константы для уровней сложности
export const DIFFICULTY_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
} as const;

// Константы для типов упражнений
export const EXERCISE_TYPES = {
  STRENGTH: 'strength',
  CARDIO: 'cardio',
  FLEXIBILITY: 'flexibility',
  BALANCE: 'balance',
} as const;

// Константы для периодов статистики
export const STATS_PERIODS = {
  WEEK: 'week',
  MONTH: 'month',
  YEAR: 'year',
  ALL: 'all',
} as const;

// Константы для типов уведомлений
export const NOTIFICATION_TYPES = {
  WORKOUT_INVITATION: 'workout_invitation',
  FRIEND_REQUEST: 'friend_request',
  ACHIEVEMENT: 'achievement',
  CHALLENGE: 'challenge',
  REMINDER: 'reminder',
} as const;

// Константы для статусов
export const STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  PLANNED: 'planned',
} as const;

// Пути для роутинга
export const ROUTES = {
  HOME: '/',
  PROFILE: '/profile',
  CALENDAR: '/calendar',
  TASKS: '/tasks',
  LEADERBOARD: '/leaderboard',
  FRIENDS: '/friends',
  WORKOUT_PLANNER: '/workout-planner',
} as const;

// Настройки для валидации
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_NAME_LENGTH: 50,
  MAX_DESCRIPTION_LENGTH: 500,
  MIN_AGE: 13,
  MAX_AGE: 120,
} as const;

// Настройки для кэширования
export const CACHE = {
  USER_DATA_TTL: 5 * 60 * 1000, // 5 минут
  WORKOUTS_TTL: 10 * 60 * 1000, // 10 минут
  LEADERBOARD_TTL: 2 * 60 * 1000, // 2 минуты
} as const;

export default {
  API_CONFIG,
  APP_CONFIG,
  WORKOUT_CATEGORIES,
  DIFFICULTY_LEVELS,
  EXERCISE_TYPES,
  STATS_PERIODS,
  NOTIFICATION_TYPES,
  STATUS,
  ROUTES,
  VALIDATION,
  CACHE,
};
