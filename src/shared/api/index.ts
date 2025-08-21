import PocketBase from 'pocketbase'

export const pb = new PocketBase(import.meta.env.VITE_PB_URL || "https://gym.larek.tech");
pb.autoCancellation(false);