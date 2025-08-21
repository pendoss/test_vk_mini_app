import {Task, UserTasks} from "@/features/tasks/model/types.ts";
import {pb} from "@/shared/api";

export class TasksApiService {
  async getTasks(): Promise<Task[]> {
    return await pb.collection("tasks").getFullList() as Task[];
  }

  async markTaskCompleted(task: UserTasks): Promise<void>{
    return await pb.collection("userTasks").update(task.id, {...task, completed: true});
  }

}

export const taskApi = new TasksApiService();
