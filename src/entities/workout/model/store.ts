import { makeAutoObservable, runInAction } from 'mobx';
import { WorkoutPlan, WorkoutTemplate, WorkoutInvitation, CreateWorkoutRequest } from '../api';
import { workoutApi } from '../api';
import { getApiErrorMessage } from '@/shared/api';

class WorkoutStore {
  workouts: WorkoutPlan[] = [];
  todayWorkouts: WorkoutPlan[] = [];
  templates: WorkoutTemplate[] = [];
  invitations: WorkoutInvitation[] = [];
  calendarWorkouts: WorkoutPlan[] = [];
  error: string | null = null;
  
  // Loading states для разных операций
  loadingStates = {
    workouts: false,
    todayWorkouts: false,
    templates: false,
    invitations: false,
    calendar: false,
    creating: false,
    updating: false,
    deleting: false,
  };

  constructor() {
    makeAutoObservable(this);
    this.initializeWorkouts();
  }

  // Инициализация тренировок при запуске
  async initializeWorkouts() {
    try {
      await Promise.all([
        this.fetchWorkouts(),
        this.fetchTodayWorkouts(),
        this.fetchWorkoutTemplates(),
        this.fetchWorkoutInvitations(),
      ]);
    } catch (error) {
      console.error('Failed to initialize workouts:', error);
    }
  }

  // Получить все тренировки
  async fetchWorkouts() {
    runInAction(() => {
      this.loadingStates.workouts = true;
      this.error = null;
    });

    try {
      const workouts = await workoutApi.getWorkouts();
      runInAction(() => {
        this.workouts = workouts;
        this.loadingStates.workouts = false;
      });
      return workouts;
    } catch (error) {
      runInAction(() => {
        this.error = getApiErrorMessage(error);
        this.loadingStates.workouts = false;
      });
      throw error;
    }
  }

  // Получить тренировки на сегодня
  async fetchTodayWorkouts() {
    runInAction(() => {
      this.loadingStates.todayWorkouts = true;
      this.error = null;
    });

    try {
      const todayWorkouts = await workoutApi.getTodayWorkouts();
      runInAction(() => {
        this.todayWorkouts = todayWorkouts;
        this.loadingStates.todayWorkouts = false;
      });
      return todayWorkouts;
    } catch (error) {
      runInAction(() => {
        this.error = getApiErrorMessage(error);
        this.loadingStates.todayWorkouts = false;
      });
      throw error;
    }
  }

  // Получить тренировки для календаря
  async fetchWorkoutsByDateRange(startDate: string, endDate: string) {
    runInAction(() => {
      this.loadingStates.calendar = true;
      this.error = null;
    });

    try {
      const calendarWorkouts = await workoutApi.getWorkoutsByDateRange(startDate, endDate);
      runInAction(() => {
        this.calendarWorkouts = calendarWorkouts;
        this.loadingStates.calendar = false;
      });
      return calendarWorkouts;
    } catch (error) {
      runInAction(() => {
        this.error = getApiErrorMessage(error);
        this.loadingStates.calendar = false;
      });
      throw error;
    }
  }

  // Получить шаблоны тренировок
  async fetchWorkoutTemplates() {
    runInAction(() => {
      this.loadingStates.templates = true;
      this.error = null;
    });

    try {
      const templates = await workoutApi.getWorkoutTemplates();
      runInAction(() => {
        this.templates = templates;
        this.loadingStates.templates = false;
      });
      return templates;
    } catch (error) {
      runInAction(() => {
        this.error = getApiErrorMessage(error);
        this.loadingStates.templates = false;
      });
      throw error;
    }
  }

  // Получить приглашения на тренировки
  async fetchWorkoutInvitations() {
    runInAction(() => {
      this.loadingStates.invitations = true;
      this.error = null;
    });

    try {
      const invitations = await workoutApi.getWorkoutInvitations();
      runInAction(() => {
        this.invitations = invitations;
        this.loadingStates.invitations = false;
      });
      return invitations;
    } catch (error) {
      runInAction(() => {
        this.error = getApiErrorMessage(error);
        this.loadingStates.invitations = false;
      });
      throw error;
    }
  }

  // Создать тренировку
  async createWorkout(workoutData: CreateWorkoutRequest) {
    runInAction(() => {
      this.loadingStates.creating = true;
      this.error = null;
    });

    try {
      const newWorkout = await workoutApi.createWorkout(workoutData);
      runInAction(() => {
        this.workouts.push(newWorkout);
        // Если тренировка на сегодня, добавляем и туда
        const today = new Date().toISOString().split('T')[0];
        if (newWorkout.date === today) {
          this.todayWorkouts.push(newWorkout);
        }
        this.loadingStates.creating = false;
      });
      return newWorkout;
    } catch (error) {
      runInAction(() => {
        this.error = getApiErrorMessage(error);
        this.loadingStates.creating = false;
      });
      throw error;
    }
  }

  // Обновить тренировку
  async updateWorkout(workoutId: string, updates: Partial<WorkoutPlan>) {
    runInAction(() => {
      this.loadingStates.updating = true;
      this.error = null;
    });

    try {
      const updatedWorkout = await workoutApi.updateWorkout(workoutId, updates);
      runInAction(() => {
        // Обновляем в основном списке
        const index = this.workouts.findIndex(w => w.id === workoutId);
        if (index !== -1) {
          this.workouts[index] = updatedWorkout;
        }
        
        // Обновляем в сегодняшних тренировках
        const todayIndex = this.todayWorkouts.findIndex(w => w.id === workoutId);
        if (todayIndex !== -1) {
          this.todayWorkouts[todayIndex] = updatedWorkout;
        }
        
        // Обновляем в календаре
        const calendarIndex = this.calendarWorkouts.findIndex(w => w.id === workoutId);
        if (calendarIndex !== -1) {
          this.calendarWorkouts[calendarIndex] = updatedWorkout;
        }
        
        this.loadingStates.updating = false;
      });
      return updatedWorkout;
    } catch (error) {
      runInAction(() => {
        this.error = getApiErrorMessage(error);
        this.loadingStates.updating = false;
      });
      throw error;
    }
  }

  // Удалить тренировку
  async deleteWorkout(workoutId: string) {
    runInAction(() => {
      this.loadingStates.deleting = true;
      this.error = null;
    });

    try {
      await workoutApi.deleteWorkout(workoutId);
      runInAction(() => {
        this.workouts = this.workouts.filter(w => w.id !== workoutId);
        this.todayWorkouts = this.todayWorkouts.filter(w => w.id !== workoutId);
        this.calendarWorkouts = this.calendarWorkouts.filter(w => w.id !== workoutId);
        this.loadingStates.deleting = false;
      });
    } catch (error) {
      runInAction(() => {
        this.error = getApiErrorMessage(error);
        this.loadingStates.deleting = false;
      });
      throw error;
    }
  }

  // Очистить ошибки
  clearError() {
    runInAction(() => {
      this.error = null;
    });
  }

  // Геттеры для удобства
  get isLoadingAny() {
    return Object.values(this.loadingStates).some(loading => loading);
  }

  get completedWorkouts() {
    return this.workouts.filter(w => w.status === 'completed');
  }

  get plannedWorkouts() {
    return this.workouts.filter(w => w.status === 'planned');
  }

  get cancelledWorkouts() {
    return this.workouts.filter(w => w.status === 'cancelled');
  }

  get upcomingWorkouts() {
    const now = new Date();
    return this.workouts.filter(w => {
      const workoutDate = new Date(`${w.date}T${w.time}`);
      return workoutDate > now && w.status === 'planned';
    }).sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA.getTime() - dateB.getTime();
    });
  }

  // Получить тренировку по ID
  getWorkoutById(id: string) {
    return this.workouts.find(w => w.id === id);
  }

  // Получить тренировки по дате
  getWorkoutsByDate(date: string) {
    return this.workouts.filter(w => w.date === date);
  }
}

export const workoutStore = new WorkoutStore();
