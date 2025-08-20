// // Центральный API файл - объединяет все сервисы
// import { userApi } from '@/entities/user/api';
// import { workoutApi } from '@/entities/workout/api';
// import { tasksApi } from '@/features/tasks/api';
// import { socialApi } from '@/features/social/api';
//
// // Объединяем все API сервисы для удобного использования
// export const api = {
//   // Сущности
//   user: userApi,
//   workout: workoutApi,
//
//   // Фичи
//   tasks: tasksApi,
//   social: socialApi,
// };
//
// // Реэкспорт типов из всех API модулей
// export type {
//   // User API types
//   LeaderboardEntry,
//   Friend,
//   FriendRequest,
//   SearchResult,
//   WorkoutPlan,
//   UserActivity,
//   Task,
//   HomeData,
// } from '@/entities/user/api';
//
// export type {
//   // Workout API types
//   WorkoutPlan as WorkoutPlanType,
//   WorkoutTemplate,
//   Friend as WorkoutFriend,
//   WorkoutInvitation,
//   CreateWorkoutRequest,
// } from '@/entities/workout/api';
//
// export type {
//   // Tasks API types
//   Task as TaskType,
//   UserActivity as TaskUserActivity,
//   TaskCompletion,
// } from '@/features/tasks/api';
//
// export type {
//   // Social API types
//   Notification,
// } from '@/features/social/api';
//
//
// // Главный объект для экспорта
// export default api;
