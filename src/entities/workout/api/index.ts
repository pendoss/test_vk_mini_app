import { pb }  from "@/shared/api";
import { WorkoutPlanApi } from "@/entities/workout/model/types";

export class WorkoutApiService {
  async getAllWorkouts(): Promise<WorkoutPlanApi[]> {
      return await pb.collection("workouts").getFullList() as WorkoutPlanApi[];
  }

 async updateWorkout(id: string, workoutPlan: WorkoutPlanApi): Promise<WorkoutPlanApi> {
    return await pb.collection("workouts").update(id, workoutPlan) as WorkoutPlanApi;
 }

 async createWorkout(workoutPlan: WorkoutPlanApi): Promise<WorkoutPlanApi> {
    return await pb.collection("workouts").create(workoutPlan) as WorkoutPlanApi;
 }

 async deleteWorkout(id: string): Promise<Response | null> {
      return await pb.collection("workouts").delete(id) as unknown as Response;
 }
}

export const workoutApi = new WorkoutApiService();
