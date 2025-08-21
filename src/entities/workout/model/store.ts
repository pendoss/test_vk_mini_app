import {makeAutoObservable, runInAction} from 'mobx';
import {workoutApi} from '../api';
import {WorkoutPlan, WorkoutPlanApi} from "./types";
import {userStore} from "@/entities/user/model/store";
import {User} from "@/entities/user/model/types";

class WorkoutStore {
  workouts: WorkoutPlan[] = [];
  todayWorkouts: WorkoutPlan[] = [];
  calendarWorkouts: WorkoutPlan[] = [];
  error: string | null = null;
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

  initializeWorkouts = async () => {
    try {
      await this.fetchWorkouts();
    } catch (error) {
      console.error('Failed to initialize workouts:', error);
    }
  }

  convertApiToWorkout = async (apiWorkout: WorkoutPlanApi): Promise<WorkoutPlan> => {
    const participants: User[] = (await Promise.all(
      apiWorkout.participants.map(id => userStore.getUserById(id))
    )).filter(Boolean) as User[];
    let time = apiWorkout.time;
    if (time && time.length > 5) {
      const d = new Date(time);
      time = d.toISOString().slice(11, 16);
    }
    return { ...apiWorkout, participants, time };
  }

  convertWorkoutToApi = (workout: WorkoutPlan): WorkoutPlanApi => {
    let time = workout.time;
    if (time && time.length > 5) {
      const d = new Date(time);
      time = d.toISOString().slice(11, 16);
    }
    return {
      ...workout,
      time,
      participants: workout.participants.map(user => user.id)
    };
  }

  fetchWorkouts = async () => {
    runInAction(() => {
      this.loadingStates.workouts = true;
      this.error = null;
    });
    try {
      const apiWorkouts = await workoutApi.getAllWorkouts();
      const workouts = await Promise.all(apiWorkouts.map(this.convertApiToWorkout));
      runInAction(() => {
        this.workouts = workouts;
        this.loadingStates.workouts = false;
      });
      return workouts;
    } catch (error) {
      runInAction(() => {
        this.loadingStates.workouts = false;
      });
      throw error;
    }
  }

  createWorkout = async (workout: WorkoutPlan): Promise<WorkoutPlan> => {
    const apiWorkout = this.convertWorkoutToApi(workout);
    const newApiWorkout = await workoutApi.createWorkout(apiWorkout);
    const newWorkout = await this.convertApiToWorkout(newApiWorkout);
    runInAction(() => {
      this.workouts.push(newWorkout);
    });
    return newWorkout;
  }

  updateWorkout = async (workoutId: string, updates: WorkoutPlan) => {
    runInAction(() => {
      this.loadingStates.updating = true;
      this.error = null;
    });
    try {
      const apiUpdates = this.convertWorkoutToApi(updates);
      const updatedApiWorkout = await workoutApi.updateWorkout(workoutId, apiUpdates);
      const updatedWorkout = await this.convertApiToWorkout(updatedApiWorkout);
      runInAction(() => {
        const index = this.workouts.findIndex((w: WorkoutPlan) => w.id === workoutId);
        if (index !== -1) {
          this.workouts[index] = updatedWorkout;
        }
        const todayIndex = this.todayWorkouts.findIndex((w: WorkoutPlan) => w.id === workoutId);
        if (todayIndex !== -1) {
          this.todayWorkouts[todayIndex] = updatedWorkout;
        }
        const calendarIndex = this.calendarWorkouts.findIndex((w: WorkoutPlan) => w.id === workoutId);
        if (calendarIndex !== -1) {
          this.calendarWorkouts[calendarIndex] = updatedWorkout;
        }
        this.loadingStates.updating = false;
      });
      return updatedWorkout;
    } catch (error) {
      runInAction(() => {
        this.loadingStates.updating = false;
      });
      throw error;
    }
  }

  deleteWorkout = async (workoutId: string) => {
    runInAction(() => {
      this.loadingStates.deleting = true;
      this.error = null;
    });
    try {
      await workoutApi.deleteWorkout(workoutId);
      runInAction(() => {
        this.workouts = this.workouts.filter((w: WorkoutPlan) => w.id !== workoutId);
        this.todayWorkouts = this.todayWorkouts.filter((w: WorkoutPlan) => w.id !== workoutId);
        this.calendarWorkouts = this.calendarWorkouts.filter((w: WorkoutPlan) => w.id !== workoutId);
        this.loadingStates.deleting = false;
      });
    } catch (error) {
      runInAction(() => {
        this.loadingStates.deleting = false;
      });
      throw error;
    }
  }
}

export const workoutStore = new WorkoutStore();
