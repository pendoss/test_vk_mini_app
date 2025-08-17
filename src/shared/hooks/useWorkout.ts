import { useQuery, useMutation } from './useApi';
import { workoutApi } from '@/entities/workout/api';
import type { WorkoutPlan, WorkoutTemplate, WorkoutInvitation, CreateWorkoutRequest } from '@/entities/workout/api';

// Хук для получения всех тренировок
export function useWorkouts() {
  return useQuery(
    () => workoutApi.getWorkouts(),
    { 
      refetchOnMount: true,
      cacheTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

// Хук для получения тренировок на сегодня
export function useTodayWorkouts() {
  return useQuery(
    () => workoutApi.getTodayWorkouts(),
    { 
      refetchOnMount: true,
      cacheTime: 2 * 60 * 1000, // 2 minutes
    }
  );
}

// Хук для получения тренировок по диапазону дат (для календаря)
export function useWorkoutsByDateRange(startDate: string, endDate: string) {
  return useQuery(
    () => workoutApi.getWorkoutsByDateRange(startDate, endDate),
    { 
      enabled: !!startDate && !!endDate,
      cacheTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

// Хук для получения шаблонов тренировок
export function useWorkoutTemplates() {
  return useQuery(
    () => workoutApi.getWorkoutTemplates(),
    { 
      refetchOnMount: true,
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );
}

// Хук для получения друзей для приглашения
export function useFriendsForInvitation() {
  return useQuery(
    () => workoutApi.getFriendsForInvitation(),
    { 
      refetchOnMount: true,
      cacheTime: 3 * 60 * 1000, // 3 minutes
    }
  );
}

// Хук для получения приглашений на тренировки
export function useWorkoutInvitations() {
  return useQuery(
    () => workoutApi.getWorkoutInvitations(),
    { 
      refetchOnMount: true,
      cacheTime: 1 * 60 * 1000, // 1 minute
    }
  );
}

// Хук для создания тренировки
export function useCreateWorkout() {
  return useMutation(
    (workoutData: CreateWorkoutRequest) => workoutApi.createWorkout(workoutData),
    {
      onSuccess: (data) => {
        console.log('Workout created successfully:', data);
      },
      onError: (error) => {
        console.error('Failed to create workout:', error);
      },
    }
  );
}

// Хук для обновления тренировки
export function useUpdateWorkout() {
  return useMutation(
    ({ workoutId, updates }: { workoutId: string; updates: Partial<WorkoutPlan> }) => 
      workoutApi.updateWorkout(workoutId, updates),
    {
      onSuccess: (data) => {
        console.log('Workout updated successfully:', data);
      },
      onError: (error) => {
        console.error('Failed to update workout:', error);
      },
    }
  );
}

// Хук для удаления тренировки
export function useDeleteWorkout() {
  return useMutation(
    (workoutId: string) => workoutApi.deleteWorkout(workoutId),
    {
      onSuccess: () => {
        console.log('Workout deleted successfully');
      },
      onError: (error) => {
        console.error('Failed to delete workout:', error);
      },
    }
  );
}

// Хук для копирования тренировки
export function useCopyWorkout() {
  return useMutation(
    (workoutId: string) => workoutApi.copyWorkout(workoutId),
    {
      onSuccess: (data) => {
        console.log('Workout copied successfully:', data);
      },
      onError: (error) => {
        console.error('Failed to copy workout:', error);
      },
    }
  );
}

// Хук для завершения тренировки
export function useCompleteWorkout() {
  return useMutation(
    (workoutId: string) => workoutApi.completeWorkout(workoutId),
    {
      onSuccess: (data) => {
        console.log('Workout completed successfully:', data);
      },
      onError: (error) => {
        console.error('Failed to complete workout:', error);
      },
    }
  );
}

// Хук для отмены тренировки
export function useCancelWorkout() {
  return useMutation(
    (workoutId: string) => workoutApi.cancelWorkout(workoutId),
    {
      onSuccess: (data) => {
        console.log('Workout cancelled successfully:', data);
      },
      onError: (error) => {
        console.error('Failed to cancel workout:', error);
      },
    }
  );
}

// Хук для отправки приглашения на тренировку
export function useSendWorkoutInvitation() {
  return useMutation(
    ({ workoutId, friendId, message }: { workoutId: string; friendId: string; message?: string }) => 
      workoutApi.sendWorkoutInvitation(workoutId, friendId, message),
    {
      onSuccess: (data) => {
        console.log('Workout invitation sent successfully:', data);
      },
      onError: (error) => {
        console.error('Failed to send workout invitation:', error);
      },
    }
  );
}

// Хук для ответа на приглашение
export function useRespondToInvitation() {
  return useMutation(
    ({ invitationId, action }: { invitationId: string; action: 'accept' | 'decline' }) => 
      workoutApi.respondToInvitation(invitationId, action),
    {
      onSuccess: (data) => {
        console.log('Invitation response sent successfully:', data);
      },
      onError: (error) => {
        console.error('Failed to respond to invitation:', error);
      },
    }
  );
}

// Комбинированный хук для управления тренировками
export function useWorkoutManager() {
  const workouts = useWorkouts();
  const todayWorkouts = useTodayWorkouts();
  const templates = useWorkoutTemplates();
  const invitations = useWorkoutInvitations();
  const friendsForInvitation = useFriendsForInvitation();
  
  const createWorkout = useCreateWorkout();
  const updateWorkout = useUpdateWorkout();
  const deleteWorkout = useDeleteWorkout();
  const copyWorkout = useCopyWorkout();
  const completeWorkout = useCompleteWorkout();
  const cancelWorkout = useCancelWorkout();
  const sendInvitation = useSendWorkoutInvitation();
  const respondToInvitation = useRespondToInvitation();

  return {
    // Data
    workouts: workouts.data || [],
    todayWorkouts: todayWorkouts.data || [],
    templates: templates.data || [],
    invitations: invitations.data || [],
    friendsForInvitation: friendsForInvitation.data || [],
    
    // Loading states
    isLoadingWorkouts: workouts.loading,
    isLoadingTodayWorkouts: todayWorkouts.loading,
    isLoadingTemplates: templates.loading,
    isLoadingInvitations: invitations.loading,
    isLoadingFriends: friendsForInvitation.loading,
    
    // Errors
    workoutsError: workouts.error,
    todayWorkoutsError: todayWorkouts.error,
    templatesError: templates.error,
    invitationsError: invitations.error,
    friendsError: friendsForInvitation.error,
    
    // Actions
    createWorkout: createWorkout.execute,
    updateWorkout: updateWorkout.execute,
    deleteWorkout: deleteWorkout.execute,
    copyWorkout: copyWorkout.execute,
    completeWorkout: completeWorkout.execute,
    cancelWorkout: cancelWorkout.execute,
    sendInvitation: sendInvitation.execute,
    respondToInvitation: respondToInvitation.execute,
    
    // Refresh functions
    refreshWorkouts: workouts.refetch,
    refreshTodayWorkouts: todayWorkouts.refetch,
    refreshTemplates: templates.refetch,
    refreshInvitations: invitations.refetch,
    refreshFriends: friendsForInvitation.refetch,
  };
}
