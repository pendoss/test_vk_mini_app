export interface Exercise {
  id: string;
  name: string;
  type: 'strength' | 'cardio' | 'flexibility' | 'balance';
  targetMuscles: string[];
  instructions?: string;
  equipment?: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  imageUrl?: string;
  videoUrl?: string;
}

export interface WorkoutExercise {
  exerciseId: string;
  exercise?: Exercise;
  sets: number;
  reps?: number;
  duration?: number; // в секундах
  weight?: number;
  restTime?: number; // в секундах
  notes?: string;
  order: number;
}

export interface Workout {
  id: string;
  name: string;
  description?: string;
  category: 'strength' | 'cardio' | 'flexibility' | 'mixed' | 'sports';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number; // в минутах
  exercises: WorkoutExercise[];
  tags: string[];
  isPublic: boolean;
  isFavorite: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastPerformed?: string;
  timesPerformed: number;
  imageUrl?: string;
}

export interface WorkoutSession {
  id: string;
  workoutId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  exercises: SessionExercise[];
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  notes?: string;
  rating?: number; // 1-5
  calories?: number;
  totalWeight?: number;
}

export interface SessionExercise {
  exerciseId: string;
  sets: SessionSet[];
  notes?: string;
}

export interface SessionSet {
  reps: number;
  weight: number;
  duration: number; // в секундах
  completed: boolean;
  restTime?: number;
}

export interface WorkoutPlan {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  estimatedDuration: number;
  friends: string[];
  afterWorkout: string;
  status: 'planned' | 'completed' | 'cancelled';
  createdAt: string;
  createdBy: string;
}

export interface WorkoutInvitation {
  id: string;
  workoutId: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  message: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
}

export interface WorkoutStats {
  totalWorkouts: number;
  totalTime: number; // в минутах
  totalCalories: number;
  averageWorkoutTime: number;
  favoriteCategory: string;
  streakDays: number;
  weeklyGoal: number;
  weeklyProgress: number;
}

export interface CreateWorkoutRequest {
  name: string;
  description?: string;
  category: string;
  difficulty: string;
  estimatedDuration: number;
  exercises: Omit<WorkoutExercise, 'exerciseId'>[];
  tags: string[];
  isPublic: boolean;
}

export interface UpdateWorkoutRequest {
  name?: string;
  description?: string;
  category?: string;
  difficulty?: string;
  estimatedDuration?: number;
  exercises?: Omit<WorkoutExercise, 'exerciseId'>[];
  tags?: string[];
  isPublic?: boolean;
  isFavorite?: boolean;
}
