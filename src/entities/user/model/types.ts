export interface User {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  level: number;
  avatar?: string;
  city?: string;
  birthDate?: string | null;
  sex?: 0 | 1 | 2; // VK API format
  status: "online" | "offline" | "training";
  workoutsCompleted: number;
  workoutsPlaned: number;
  workoutsWithFriends: number;
  totalWorkouts: number;
  friendAdded: number;
  weight: number;
  primaryGym: string;
  records: string[];
  point: number;
}