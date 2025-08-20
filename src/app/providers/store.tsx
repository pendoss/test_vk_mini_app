// import { createContext, useContext, ReactNode } from 'react';
// import { userStore } from '@/entities/user/model/store';
// import { workoutStore } from '@/entities/workout/model/store';
//
// export class RootStore {
//   userStore = userStore;
//   workoutStore = workoutStore;
//
//   constructor() {
//     // Инициализация уже происходит в конструкторах store
//   }
//
//   // Методы для управления приложением
//   async initializeApp() {
//     try {
//       console.log('Initializing TrainSync app...');
//       // Stores инициализируются автоматически в своих конструкторах
//       return true;
//     } catch (error) {
//       console.error('Failed to initialize app:', error);
//       return false;
//     }
//   }
//
//   // Сброс всех store
//   reset() {
//     this.userStore.clearError();
//     this.workoutStore.clearError();
//   }
//
//   // Проверка загрузки
//   get isLoading() {
//     return this.userStore.isLoadingAny || this.workoutStore.isLoadingAny;
//   }
//
//   // Проверка ошибок
//   get hasErrors() {
//     return !!this.userStore.error || !!this.workoutStore.error;
//   }
//
//   get errors() {
//     const errors = [];
//     if (this.userStore.error) errors.push(this.userStore.error);
//     if (this.workoutStore.error) errors.push(this.workoutStore.error);
//     return errors;
//   }
// }
//
// export const rootStore = new RootStore();
//
// const StoreContext = createContext<RootStore | null>(null);
//
// interface StoreProviderProps {
//   children: ReactNode;
// }
//
// export function StoreProvider({ children }: StoreProviderProps) {
//   return (
//     <StoreContext.Provider value={rootStore}>
//       {children}
//     </StoreContext.Provider>
//   );
// }
//
// export function useStore(): RootStore {
//   const store = useContext(StoreContext);
//   if (!store) {
//     throw new Error('useStore must be used within a StoreProvider');
//   }
//   return store;
// }
//
// export function useUserStore() {
//   return useStore().userStore;
// }
//
// export function useWorkoutStore() {
//   return useStore().workoutStore;
// }
