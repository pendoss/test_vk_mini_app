export interface Task {
    id: string;
    title: string;
    description: string;
    detailedDescription: string;
    difficulty: "легкий" |"средний"| "тяжелый";
    points: number;
    endDate: string;
    category: string;
    icon: string;
    goal: number;
    progress: number;
    completed: boolean;
}

export interface UserTasks {
    id: string;
    vkUserId: string;
    task: Task;
    progress: number;
    completed: boolean;
    expand?: {
        task_id?: Task[];
    };
}