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
        points: 0,
    };

}

class UserStore {
    user: User | null = null;
    isLoading = false;
    error: string | null = null;
    loadingStates = {
        user: false,
        profile: false,
        friends: false,
        requests: false,
        leaderboard: false,
        search: false,
        home: false,
    };

    constructor() {
        makeAutoObservable(this);
        this.initializeUser();
    }

    // Инициализация пользователя при запуске приложения
    async initializeUser() {
        try {
            await this.fetchCurrentUser();
        } catch (error) {
            console.error('Failed to initialize user:', error);
        }
    }


    // Получить текущего пользователя VK и сохранить в стор
    async fetchCurrentUser() {
        this.isLoading = true;
        this.error = null;
        const userInfo = await bridge.send('VKWebAppGetUserInfo');
        const existingRecord = await userApi.getUser(userInfo.id.toString());
        if (existingRecord) {// TODO: подумать правильный ли пользователь у меня загружается
            this.setUser(existingRecord);
        } else {
            const user = await userApi.createUser(mapVkUserToApplication(userInfo));
            this.setUser(user);
        }
    }

    // Получить данные для главной страницы
    // Очистить ошибки
    clearError() {
        runInAction(() => {
            this.error = null;
        });
    }

    async updateUserStats(
        field: keyof Pick<User, 'workoutsCompleted' | 'workoutsPlaned' | 'workoutsWithFriends' | 'totalWorkouts' | 'friendAdded'>,
        increment: number = 1
    ): Promise<void> {
        runInAction(() => {
            if (this.user) {
                this.user[field] = (this.user[field] ?? 0) + increment;
            }
        });
        if (this.user) {
            await taskStore.checkAndUpdateTasksAfterUserAction();
            await userApi.updateUser(this.user.id, { [field]: this.user[field] });
        }
    }

    // Геттеры для удобства
    get isLoadingAny() {
        return Object.values(this.loadingStates).some(loading => loading);
    }

    // get userPoints() {
    //   return this.homeData?.user?.points || this.user?.points || 0;
    // }



    get userName() {
        return this.user?.name ||
            (this.user?.firstName && this.user?.lastName
                ? `${this.user.firstName} ${this.user.lastName}`
                : this.user?.firstName) ||
            'Пользователь';
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
