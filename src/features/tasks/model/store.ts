import {makeAutoObservable, runInAction} from "mobx";
import {Task, UserTasks} from "@/features/tasks/model/types.ts";
import {taskApi} from "@/features";
import {userStore} from "@/entities/user";


class TaskStore {
    tasks: Task[] = [];
    userTasks: UserTasks[] = [];
    completedTasks: UserTasks[] = [];

    constructor() {
        makeAutoObservable(this);
        this.initializeTasks().catch((err) => { throw err; });
    }

    async initializeTasks() {
        const taskList = await taskApi.getTasks() as Task[];
        this.setTasks(taskList);
    }



    markCompleted(task: UserTasks) {
        runInAction(() => {
            const given = this.userTasks.find(t => t.id === task.id);
            if (given) {
                given.completed = true;
            }
        })
        taskApi.markTaskCompleted(task).catch((err) => { throw err; });
    }

    setTasks(tasks: Task[]) {
        runInAction(() => {
            this.tasks = tasks;
        });
    }
    setUserTasks(tasks: UserTasks[]) {
        runInAction(() => {
            this.userTasks = tasks.map(item => ({
                ...item,
                task: item.expand?.task_id?.[0] || item.task
            }));
        });
    }

    async fetchTasks() {
        const mappedTasks = await taskApi.getTasks();
        runInAction(() => {
            this.tasks = mappedTasks;
            this.setTasks(mappedTasks);
        })

    }

    async checkAndUpdateTasksAfterUserAction() {
        const user = userStore.user;
        if (!user) return;
        const userStats = {
            workoutsCompleted: user.workoutsCompleted,
            workoutsPlaned: user.workoutsPlaned,
            workoutsWithFriends: user.workoutsWithFriends,
            totalWorkouts: user.totalWorkouts,
            friendAdded: user.friendAdded,
        };

        for (const userTask of this.userTasks) {
            const goalKey = userTask.task.category;
            const userValue = userStats[goalKey as keyof typeof userStats];

            if (userValue !== undefined && userValue >= userTask.task.goal && !userTask.completed) {
                this.markCompleted(userTask);
                await userStore.updateUserScore();
            }
        }
    }
}

export const taskStore = new TaskStore();