import { useQuery, useMutation } from './useApi';
import { tasksApi } from '@/features/tasks/api';
import type { Task, UserActivity, TaskCompletion } from '@/features/tasks/api';

// Хук для получения всех задач
export function useTasks() {
  return useQuery(
    () => tasksApi.getTasks(),
    { 
      refetchOnMount: true,
      cacheTime: 3 * 60 * 1000, // 3 minutes
    }
  );
}

// Хук для получения ежедневных задач
export function useDailyTasks() {
  return useQuery(
    () => tasksApi.getDailyTasks(),
    { 
      refetchOnMount: true,
      cacheTime: 2 * 60 * 1000, // 2 minutes
    }
  );
}

// Хук для получения недельных задач
export function useWeeklyTasks() {
  return useQuery(
    () => tasksApi.getWeeklyTasks(),
    { 
      refetchOnMount: true,
      cacheTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

// Хук для получения активности пользователя
export function useUserActivityForTasks() {
  return useQuery(
    () => tasksApi.getUserActivity(),
    { 
      refetchOnMount: true,
      cacheTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

// Хук для обновления прогресса задачи
export function useUpdateTaskProgress() {
  return useMutation(
    ({ taskId, progress }: { taskId: string; progress: number }) => 
      tasksApi.updateTaskProgress(taskId, progress),
    {
      onSuccess: (data) => {
        console.log('Task progress updated successfully:', data);
      },
      onError: (error) => {
        console.error('Failed to update task progress:', error);
      },
    }
  );
}

// Хук для завершения задачи
export function useCompleteTask() {
  return useMutation(
    (taskId: string) => tasksApi.completeTask(taskId),
    {
      onSuccess: (data) => {
        console.log('Task completed successfully:', data);
        // Можно показать уведомление о получении очков/достижений
        if (data.levelUp) {
          console.log(`Level up! From ${data.levelUp.oldLevel} to ${data.levelUp.newLevel}`);
        }
        if (data.newAchievements && data.newAchievements.length > 0) {
          console.log('New achievements unlocked:', data.newAchievements);
        }
      },
      onError: (error) => {
        console.error('Failed to complete task:', error);
      },
    }
  );
}

// Хук для обновления активности пользователя
export function useUpdateUserActivity() {
  return useMutation(
    (activity: Partial<UserActivity>) => tasksApi.updateUserActivity(activity),
    {
      onSuccess: (data) => {
        console.log('User activity updated successfully:', data);
      },
      onError: (error) => {
        console.error('Failed to update user activity:', error);
      },
    }
  );
}

// Хук для проверки триггеров автоматических задач
export function useCheckTaskTriggers() {
  return useMutation(
    () => tasksApi.checkTaskTriggers(),
    {
      onSuccess: (data) => {
        console.log('Task triggers checked, updated tasks:', data);
      },
      onError: (error) => {
        console.error('Failed to check task triggers:', error);
      },
    }
  );
}

// Комбинированный хук для управления задачами
export function useTasksManager() {
  const tasks = useTasks();
  const dailyTasks = useDailyTasks();
  const weeklyTasks = useWeeklyTasks();
  const userActivity = useUserActivityForTasks();
  
  const updateProgress = useUpdateTaskProgress();
  const completeTask = useCompleteTask();
  const updateActivity = useUpdateUserActivity();
  const checkTriggers = useCheckTaskTriggers();

  // Разделяем задачи по категориям
  const allTasks = tasks.data || [];
  const automaticTasks = allTasks.filter(task => task.type === 'automatic');
  const manualTasks = allTasks.filter(task => task.type === 'manual');
  const completedTasks = allTasks.filter(task => task.completed);
  const activeTasks = allTasks.filter(task => !task.completed);

  // Группируем задачи по сложности
  const tasksByDifficulty = {
    легкий: allTasks.filter(task => task.difficulty === 'легкий'),
    средний: allTasks.filter(task => task.difficulty === 'средний'),
    тяжелый: allTasks.filter(task => task.difficulty === 'тяжелый'),
    невозможный: allTasks.filter(task => task.difficulty === 'невозможный'),
  };

  return {
    // Raw data
    allTasks,
    dailyTasks: dailyTasks.data || [],
    weeklyTasks: weeklyTasks.data || [],
    userActivity: userActivity.data,
    
    // Filtered data
    automaticTasks,
    manualTasks,
    completedTasks,
    activeTasks,
    tasksByDifficulty,
    
    // Loading states
    isLoadingTasks: tasks.loading,
    isLoadingDailyTasks: dailyTasks.loading,
    isLoadingWeeklyTasks: weeklyTasks.loading,
    isLoadingActivity: userActivity.loading,
    
    // Errors
    tasksError: tasks.error,
    dailyTasksError: dailyTasks.error,
    weeklyTasksError: weeklyTasks.error,
    activityError: userActivity.error,
    
    // Actions
    updateTaskProgress: updateProgress.execute,
    completeTask: completeTask.execute,
    updateUserActivity: updateActivity.execute,
    checkTaskTriggers: checkTriggers.execute,
    
    // Refresh functions
    refreshTasks: tasks.refetch,
    refreshDailyTasks: dailyTasks.refetch,
    refreshWeeklyTasks: weeklyTasks.refetch,
    refreshActivity: userActivity.refetch,
    
    // Helper functions
    getTaskById: (id: string) => allTasks.find(task => task.id === id),
    getTasksByCategory: (category: string) => allTasks.filter(task => task.category === category),
    getCompletionRate: () => {
      if (allTasks.length === 0) return 0;
      return (completedTasks.length / allTasks.length) * 100;
    },
    getTotalPoints: () => completedTasks.reduce((sum, task) => sum + task.points, 0),
  };
}
