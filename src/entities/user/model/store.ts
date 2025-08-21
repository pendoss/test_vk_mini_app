import {makeAutoObservable, runInAction} from 'mobx';
import {userApi} from '../api';
import {User} from "@/entities/user";
import bridge, {UserInfo} from "@vkontakte/vk-bridge";
import {taskStore} from "@/features/tasks/model/store.ts";

function mapVkUserToApplication(userInfo: UserInfo): User {
    return {
        id: userInfo.id.toString(),
        name: userInfo.first_name + " " + userInfo.last_name,
        firstName: userInfo.first_name,
        lastName: userInfo.last_name,
        level: 0,
        avatar: userInfo.photo_200,
        city: userInfo.city?.title ?? "",
        birthDate: userInfo.bdate,
        sex: userInfo.sex,
        status: "online",
        workoutsCompleted: 0,
        workoutsPlaned: 0,
        workoutsWithFriends: 0,
        totalWorkouts: 0,
        friendAdded: 0,
        weight: 0,
        primaryGym: "",
        records: [""],
        point: 0,
    };

}

class UserStore {
    user: User | null = null;
    isLoading = false;
    error: string | null = null;

    constructor() {
        makeAutoObservable(this);
        this.initializeUser();
    }

    async initializeUser() {
        try {
            await this.fetchCurrentUser();
        } catch (error) {
            console.error('Failed to initialize user:', error);
        }
    }

    async fetchCurrentUser() {
        this.isLoading = true;
        this.error = null;
        const userInfo = await bridge.send('VKWebAppGetUserInfo');
        const existingRecord = await userApi.getUser(userInfo.id.toString());
        if (existingRecord) {
            this.setUser(existingRecord);
        } else {
            const user = await userApi.createUser(mapVkUserToApplication(userInfo));
            this.setUser(user);
        }
    }

    async updateUserStats(
        field: keyof Pick<User, 'workoutsCompleted' | 'workoutsPlaned' | 'workoutsWithFriends' | 'totalWorkouts' | 'friendAdded'>,
        increment: number = 1
    ): Promise<void> {
        runInAction(() => {
            if (this.user) {
                this.user[field] = (this.user[field] ?? 0) + increment;
            }
            this.updateUserScore();
        });
        if (this.user) {
            await taskStore.checkAndUpdateTasksAfterUserAction();
            await userApi.updateUser(this.user.id, { [field]: this.user[field] });
        }
    }

    async updateUserScore(): Promise<void> {
        await runInAction(async () => {
            if (this.user) {
                this.user.point = this.user.workoutsPlaned * 10 + this.user.workoutsCompleted * 15 + this.user.workoutsWithFriends * 20 ;
                this.user.level = Math.floor(this.user.point / 500);
                await userApi.updateUser(this.user.id, {level: this.user.level, point: this.user.point} );
            }
        })

    }

    setUser(user: User) {
        runInAction(() => {
            this.user = user;
        });
    }

    async getUserById(id: string): Promise<User | null> {
        try {
            return await userApi.getUser(id);
        } catch {
            return null;
        }
    }
}

export const userStore = new UserStore();
