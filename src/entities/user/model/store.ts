import { makeAutoObservable, runInAction } from 'mobx';
import { User, UserProfile, LeaderboardEntry, Friend, FriendRequest, SearchResult, HomeData } from '../api';
import { userApi } from '../api';
import { getApiErrorMessage } from '@/shared/api';

class UserStore {
  user: User | null = null;
  profile: UserProfile | null = null;
  homeData: HomeData | null = null;
  isLoading = false;
  error: string | null = null;
  friends: Friend[] = [];
  friendRequests: FriendRequest[] = [];
  leaderboard: LeaderboardEntry[] = [];
  searchResults: SearchResult[] = [];
  
  // Loading states для разных операций
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
      await this.fetchHomeData();
    } catch (error) {
      console.error('Failed to initialize user:', error);
    }
  }

  // Получить текущего пользователя
  async fetchCurrentUser() {
    runInAction(() => {
      this.loadingStates.user = true;
      this.error = null;
    });

    try {
      const user = await userApi.getCurrentUser();
      runInAction(() => {
        this.user = user;
        this.loadingStates.user = false;
      });
      return user;
    } catch (error) {
      runInAction(() => {
        this.error = getApiErrorMessage(error);
        this.loadingStates.user = false;
      });
      throw error;
    }
  }

  // Получить данные для главной страницы
  async fetchHomeData() {
    runInAction(() => {
      this.loadingStates.home = true;
      this.error = null;
    });

    try {
      const homeData = await userApi.getHomeData();
      runInAction(() => {
        this.homeData = homeData;
        this.loadingStates.home = false;
      });
      return homeData;
    } catch (error) {
      runInAction(() => {
        this.error = getApiErrorMessage(error);
        this.loadingStates.home = false;
      });
      throw error;
    }
  }

  // Очистить ошибки
  clearError() {
    runInAction(() => {
      this.error = null;
    });
  }

  // Геттеры для удобства
  get isLoadingAny() {
    return Object.values(this.loadingStates).some(loading => loading);
  }

  get currentUser() {
    return this.user;
  }

  get userLevel() {
    return this.homeData?.user?.level || this.user?.level || 1;
  }

  get userPoints() {
    return this.homeData?.user?.points || this.user?.points || 0;
  }

  get userName() {
    return this.user?.name || 
           (this.user?.firstName && this.user?.lastName 
             ? `${this.user.firstName} ${this.user.lastName}` 
             : this.user?.firstName) || 
           'Пользователь';
  }
}

export const userStore = new UserStore();
