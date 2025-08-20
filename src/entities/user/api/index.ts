import {apiClient, pb} from "@/shared/api";
import {User} from "../model/types.ts"
import {userStore} from "@/entities/user";





// export interface UserProfile extends User {
//     fullName: string;
//     birthDate: string | null;
//     weight: number;
//     primaryGym: string;
//     records: Record<string, number>; // "Жим лежа": 120
//     upcomingWorkouts: WorkoutPlan[];
// }

export interface LeaderboardEntry {
    id: string;
    name: string;
    points: number;
    level: number;
    rank: number;
    change: number; // -1, 0, 1 для изменения позиции
    city: string;
    gym: string;
    todayPoints: number;
    weekPoints: number;
    avatar?: string;
}

export interface Friend {
    id: string;
    name: string;
    level: number;
    points: number;
    city: string;
    gym: string;
    status: "online" | "offline" | "training";
    lastWorkout: string;
    totalWorkouts: number;
    friendsSince: string;
    mutualFriends: number;
}

export interface FriendRequest {
    id: string;
    name: string;
    level: number;
    city: string;
    gym: string;
    sentAt: string;
    mutualFriends: number;
    type: "incoming" | "outgoing";
}

export interface SearchResult {
    id: string;
    name: string;
    level: number;
    city: string;
    gym: string;
    mutualFriends: number;
    status: "not_friend" | "request_sent" | "request_received" | "friend";
}

export interface WorkoutPlan {
    id: string;
    title: string;
    description: string;
    date: string; // YYYY-MM-DD format
    time: string; // HH:MM format
    location: string;
    estimatedDuration: number; // in minutes
    friends: string[]; // friend names or IDs
    afterWorkout: string;
    status: "planned" | "completed" | "cancelled";
    createdAt: string;
    createdBy: string;
}

export interface UserActivity {
    workoutsCompleted: number;
    friendsAdded: number;
    workoutsPlanned: number;
    workoutsWithFriends: number;
    dailyPoints: number;
    totalWorkouts: number;
}

// Additional request types
export interface CreateUserRequest {
    firstName: string;
    lastName: string;
    birthDate?: string;
    city?: string;
}

export interface UpdateUserRequest {
    firstName?: string;
    lastName?: string;
    birthDate?: string;
    city?: string;
    weight?: number;
    primaryGym?: string;
}

export interface LeaderboardParams {
    limit?: number;
    offset?: number;
    timeframe?: "week" | "month" | "all";
}

export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt: string;
}

export interface Task {
    id: string;
    title: string;
    description: string;
    detailedDescription: string;
    difficulty: "легкий" | "средний" | "тяжелый" | "невозможный";
    points: number;
    timeRemaining: string;
    progress: number; // 0-100
    maxProgress: number;
    completed: boolean;
    category: string;
    type: "automatic" | "manual";
    triggerAction?: string;
    icon: string; // icon name
}

export interface HomeData {
    user: {
        level: number;
        points: number;
    };
    todayWorkouts: WorkoutPlan[];
}

export interface Points{
    id: string;
    user: User;
    value: number;
}

// User API Service
export class UserApiService {
    async createUser(user: User): Promise<User> {
        try {
            const createdUser = await pb.collection("vkUsers").create(user) as User;
            await pb.collection("points").create({ user: user.id, value: 0 });
            return createdUser;
        } catch (error) {
            console.error("UserApiService.createUser error:", error);
            // Throw a more descriptive error for the store/UI
            throw new Error( "Failed to create VK user");
        }
    }

    // Получить данные для главной страницы
    async getHomeData(): Promise<HomeData> {
        const response = await apiClient.get<HomeData>("/user/home");
        return response.data;
    }
    //TODO:это не так работать должно,таблица points для хранения изменений очков пользователя
    async getUserPoints(id: string): Promise<number> {
        return await pb.collection("points").getOne(id).then((value) =>  {return value.value});
    }

    async updateUserPoints(id: string): Promise<User | null> {
        const userPoints = await pb.collection("points").getFullList({filter: `user_id = ${id}` }) as Points[];
        const newPoints = userPoints.map((point) => point.value).reduce((a, b) => a + b);
        const user = {...userStore.user, points: newPoints };

        const updatedUser = await pb.collection("vkUsers").update(id, user).catch((error) => {
            console.error("UserApiService.updateUserPoints", error);
            return null;
        }) as User | null;
        return updatedUser as User;
    }

    async updateUser(id: string, user: Partial<User>): Promise<User> {
        return await pb.collection("vkUsers").update(id, user);
    }

    async getUser(id: string): Promise<User | null> {
        const user : User | null = await pb.collection("vkUsers").getOne(id).catch((err) => {
            console.log(err);
            return null;
        }) as User | null ;

        if (user == null) return null;

        return user;
    }
}

// Экспорт инстанса API
export const userApi = new UserApiService();
