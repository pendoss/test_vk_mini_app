import { useQuery, useMutation } from './useApi';
import { userApi } from '@/entities/user/api';
import type { User, UserProfile, LeaderboardEntry, Friend, FriendRequest, SearchResult, UserActivity } from '@/entities/user/api';

// Хук для получения текущего пользователя
export function useCurrentUser() {
  return useQuery(
    () => userApi.getCurrentUser(),
    { 
      refetchOnMount: true,
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );
}

// Хук для получения профиля пользователя
export function useUserProfile(userId?: string) {
  return useQuery(
    () => userApi.getUserProfile(userId),
    { 
      enabled: !!userId || userId === undefined, // Allow for current user profile
      cacheTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

// Хук для получения данных главной страницы
export function useHomeData() {
  return useQuery(
    () => userApi.getHomeData(),
    { 
      refetchOnMount: true,
      cacheTime: 2 * 60 * 1000, // 2 minutes
    }
  );
}

// Хук для получения лидерборда
export function useLeaderboard() {
  return useQuery(
    () => userApi.getLeaderboard(),
    { 
      refetchOnMount: true,
      cacheTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

// Хук для получения друзей
export function useFriends() {
  return useQuery(
    () => userApi.getFriends(),
    { 
      refetchOnMount: true,
      cacheTime: 3 * 60 * 1000, // 3 minutes
    }
  );
}

// Хук для получения заявок в друзья
export function useFriendRequests() {
  return useQuery(
    () => userApi.getFriendRequests(),
    { 
      refetchOnMount: true,
      cacheTime: 1 * 60 * 1000, // 1 minute
    }
  );
}

// Хук для получения активности пользователя
export function useUserActivity() {
  return useQuery(
    () => userApi.getUserActivity(),
    { 
      refetchOnMount: true,
      cacheTime: 5 * 60 * 1000, // 5 minutes
    }
  );
}

// Хук для обновления профиля
export function useUpdateProfile() {
  return useMutation(
    (profileData: Partial<UserProfile>) => userApi.updateProfile(profileData),
    {
      onSuccess: (data) => {
        console.log('Profile updated successfully:', data);
      },
      onError: (error) => {
        console.error('Failed to update profile:', error);
      },
    }
  );
}

// Хук для поиска пользователей
export function useSearchUsers() {
  return useMutation(
    (query: string) => userApi.searchUsers(query),
    {
      onError: (error) => {
        console.error('Failed to search users:', error);
      },
    }
  );
}

// Хук для отправки заявки в друзья
export function useSendFriendRequest() {
  return useMutation(
    (userId: string) => userApi.sendFriendRequest(userId),
    {
      onSuccess: () => {
        console.log('Friend request sent successfully');
      },
      onError: (error) => {
        console.error('Failed to send friend request:', error);
      },
    }
  );
}

// Хук для принятия заявки в друзья
export function useAcceptFriendRequest() {
  return useMutation(
    (requestId: string) => userApi.acceptFriendRequest(requestId),
    {
      onSuccess: () => {
        console.log('Friend request accepted successfully');
      },
      onError: (error) => {
        console.error('Failed to accept friend request:', error);
      },
    }
  );
}

// Хук для отклонения заявки в друзья
export function useDeclineFriendRequest() {
  return useMutation(
    (requestId: string) => userApi.declineFriendRequest(requestId),
    {
      onSuccess: () => {
        console.log('Friend request declined successfully');
      },
      onError: (error) => {
        console.error('Failed to decline friend request:', error);
      },
    }
  );
}

// Хук для удаления друга
export function useRemoveFriend() {
  return useMutation(
    (friendId: string) => userApi.removeFriend(friendId),
    {
      onSuccess: () => {
        console.log('Friend removed successfully');
      },
      onError: (error) => {
        console.error('Failed to remove friend:', error);
      },
    }
  );
}

// Комбинированный хук для управления друзьями
export function useFriendsManager() {
  const friends = useFriends();
  const friendRequests = useFriendRequests();
  const searchUsers = useSearchUsers();
  const sendRequest = useSendFriendRequest();
  const acceptRequest = useAcceptFriendRequest();
  const declineRequest = useDeclineFriendRequest();
  const removeFriend = useRemoveFriend();

  return {
    // Data
    friends: friends.data || [],
    friendRequests: friendRequests.data || [],
    searchResults: searchUsers.data || [],
    
    // Loading states
    isLoadingFriends: friends.loading,
    isLoadingRequests: friendRequests.loading,
    isSearching: searchUsers.loading,
    
    // Errors
    friendsError: friends.error,
    requestsError: friendRequests.error,
    searchError: searchUsers.error,
    
    // Actions
    searchUsers: searchUsers.execute,
    sendFriendRequest: sendRequest.execute,
    acceptFriendRequest: acceptRequest.execute,
    declineFriendRequest: declineRequest.execute,
    removeFriend: removeFriend.execute,
    
    // Refresh functions
    refreshFriends: friends.refetch,
    refreshRequests: friendRequests.refetch,
  };
}
