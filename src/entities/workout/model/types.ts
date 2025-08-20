import {User} from "@/entities/user";

export interface WorkoutPlan {
  id: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD format
  time: string; // HH:MM format
  location: string;
  estimatedDuration: number; // in minutes
  participants: User[]; // friend names or IDs
  afterWorkout: string;
  status: 'planned' | 'completed' | 'cancelled';
  createdAt: string;
  creator_id: string;
}

export interface WorkoutPlanApi {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  estimatedDuration: number;
  participants: string[];
  afterWorkout: string;
  status: 'planned' | 'completed' | 'cancelled';
  createdAt: string;
  creator_id: string;
}
