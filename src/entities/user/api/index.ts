import { pb} from "@/shared/api";
import {User} from "../model/types.ts"
import {ListResult, RecordModel} from "pocketbase";
import {UserRecord} from "@/pages/onboarding/ui/Onboarding.tsx";


export interface LeaderboardParams {
    limit?: number;
    offset?: number;
    timeframe?: "week" | "month" | "all";
}

export interface UserRecordApi {
    name: string;
    value: number;
}

export class UserApiService {
    async createUser(user: User): Promise<User> {
        try {
            const createdUser = await pb.collection("vkUsers").create(user) as User;
            await pb.collection("points").create({ user: user.id, value: 0 });
            return createdUser;
        } catch (error) {
            console.error("UserApiService.createUser error:", error);
            throw new Error( "Failed to create VK user");
        }
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

    async createRecord(userId: string, records: UserRecordApi[]): Promise<User> {
        const createdIds: string[] = [];
        for (const data of records) {
            try {
                const record = await pb.collection('records').create(data);
                if (record && record.id) {
                    createdIds.push(record.id as string);
                }
            } catch (err) {
                console.error('Error creating record:', data, err);
            }
        }
        if (createdIds.length !== records.length) {
            throw new Error('Не все рекорды были успешно созданы');
        }
        return await pb.collection("vkUsers").update(userId, {records: createdIds}) as User;
    }

    async getLeaderboardUsers(params: LeaderboardParams = {}): Promise<ListResult<RecordModel>> {
        const sort = '-point';
        const page = params.offset ? Math.floor(params.offset / (params.limit || 30)) + 1 : 1;
        const perPage = params.limit || 30;
        return  await pb.collection('vkUsers').getList(page, perPage, { sort });
    }

    async getAllUsers(page: number, perPage: number): Promise<User[]> {
        const result = await pb.collection("vkUsers").getList(page, perPage);
        return result.items as unknown as User[];
    }

    async getUserRecords(recordIds: string[]): Promise<UserRecord[]> {
        if (!recordIds || recordIds.length === 0) return [];
        const records: UserRecord[] = [];
        for (const id of recordIds) {
            try {
                const rec = await pb.collection('records').getOne(id);
                if (rec && rec.id && rec.name && typeof rec.value === 'number') {
                    records.push({ id: rec.id, name: rec.name, value: rec.value });
                }
            } catch (err) {
                console.error('Error getting user record:', err);
            }
        }
        return records;
    }

    async updateRecord(recordId: string, data: Partial<UserRecord>): Promise<UserRecord> {
        const rec = await pb.collection('records').update(recordId, data);
        return { id: rec.id, name: rec.name, value: rec.value };
    }

    async deleteRecord(recordId: string): Promise<void> {
        await pb.collection('records').delete(recordId);
    }
}

export const userApi = new UserApiService();
