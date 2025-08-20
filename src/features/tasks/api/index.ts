import {Task, UserTasks} from "@/features/tasks/model/types.ts";
import {pb} from "@/shared/api";

export class TasksApiService {
  async getTasks(): Promise<Task[]> {
    return await pb.collection("tasks").getFullList() as Task[];
  }

  async updateUserTask(task: Task): Promise<Task> {
    return await pb.collection("userTasks").update(task.id, task);
  }

  async getUserTasks(userId: string): Promise<UserTasks[]> {
    const allTasks = await pb.collection("userTasks").getFullList({ expand: "task_id" }) as UserTasks[];
    return allTasks.filter(task => task.vkUserId === userId);
  }

  async getUsersTasks(): Promise<UserTasks[]> {
    return await pb.collection("userTasks").getFullList({expand: "task_id"}) as UserTasks[]
  }

  async markTaskCompleted(task: UserTasks): Promise<void>{
    return await pb.collection("userTasks").update(task.id, {...task, completed: true});
  }

}

export const taskApi = new TasksApiService();
