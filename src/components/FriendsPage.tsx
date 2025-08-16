import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Users, Search, Plus, UserPlus, MessageCircle, Calendar, Trophy, MapPin, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfileModal } from './UserProfileModal';

interface Friend {
  id: string;
  name: string;
  level: number;
  points: number;
  city: string;
  gym: string;
  status: 'online' | 'offline' | 'training';
  lastWorkout: string;
  totalWorkouts: number;
  friendsSince: string;
  mutualFriends: number;
}

interface FriendRequest {
  id: string;
  name: string;
  level: number;
  city: string;
  gym: string;
  sentAt: string;
  mutualFriends: number;
  type: 'incoming' | 'outgoing';
}

interface SearchResult {
  id: string;
  name: string;
  level: number;
  city: string;
  gym: string;
  mutualFriends: number;
  status: 'not_friend' | 'request_sent' | 'request_received' | 'friend';
}

export function FriendsPage() {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const [friends, setFriends] = useState<Friend[]>([
    {
      id: '2',
      name: 'Михаил Козлов',
      level: 18,
      points: 2850,
      city: 'Москва',
      gym: 'World Gym',
      status: 'training',
      lastWorkout: '2025-01-18',
      totalWorkouts: 156,
      friendsSince: '2024-08-15',
      mutualFriends: 3
    },
    {
      id: '3',
      name: 'Дмитрий Волков',
      level: 16,
      points: 2650,
      city: 'Москва',
      gym: 'Gold Gym',
      status: 'online',
      lastWorkout: '2025-01-17',
      totalWorkouts: 134,
      friendsSince: '2024-09-22',
      mutualFriends: 2
    },
    {
      id: '4',
      name: 'Анна Смирнова',
      level: 15,
      points: 2420,
      city: 'Санкт-Петербург',
      gym: 'FitnessPark СПб',
      status: 'offline',
      lastWorkout: '2025-01-16',
      totalWorkouts: 89,
      friendsSince: '2024-11-10',
      mutualFriends: 1
    }
  ]);

  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([
    {
      id: '6',
      name: 'Сергей Петров',
      level: 13,
      city: 'Москва',
      gym: 'Power Gym',
      sentAt: '2025-01-17',
      mutualFriends: 2,
      type: 'incoming'
    },
    {
      id: '7',
      name: 'Мария Волкова',
      level: 11,
      city: 'Москва',
      gym: 'FitnessPark Сокольники',
      sentAt: '2025-01-16',
      mutualFriends: 1,
      type: 'incoming'
    }
  ]);

  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');

  const getStatusColor = (status: Friend['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'offline': return 'bg-gray-400';
      case 'training': return 'bg-blue-500';
    }
  };

  const getStatusLabel = (status: Friend['status']) => {
    switch (status) {
      case 'online': return 'Онлайн';
      case 'offline': return 'Не в сети';
      case 'training': return 'Тренируется';
    }
  };

  const acceptFriendRequest = (requestId: string) => {
    const request = friendRequests.find(r => r.id === requestId);
    if (request) {
      const newFriend: Friend = {
        ...request,
        points: 1500, // default points
        status: 'online',
        lastWorkout: '2025-01-15',
        totalWorkouts: 45,
        friendsSince: new Date().toISOString().split('T')[0]
      };
      setFriends([...friends, newFriend]);
      setFriendRequests(friendRequests.filter(r => r.id !== requestId));
    }
  };

  const rejectFriendRequest = (requestId: string) => {
    setFriendRequests(friendRequests.filter(r => r.id !== requestId));
  };

  const searchFriends = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));

    const mockResults: SearchResult[] = [
      {
        id: '8',
        name: 'Алексей Иванов',
        level: 16,
        city: 'Москва',
        gym: 'World Gym',
        mutualFriends: 1,
        status: "not_friend" as const
      },
      {
        id: '9',
        name: 'Юлия Соколова',
        level: 12,
        city: 'Москва',
        gym: 'FitnessPark',
        mutualFriends: 0,
        status: "not_friend" as const
      },
      {
        id: '10',
        name: 'Владимир Кузнецов',
        level: 14,
        city: 'Москва',
        gym: 'FitnessPark Сокольники',
        mutualFriends: 2,
        status: "not_friend" as const
      }
    ].filter(user => 
      user.name.toLowerCase().includes(query.toLowerCase())
    );

    setSearchResults(mockResults);
    setIsSearching(false);
  };

  const sendFriendRequest = (userId: string) => {
    setSearchResults(searchResults.map(user => 
      user.id === userId ? { ...user, status: 'request_sent' } : user
    ));
    
    // Add to outgoing requests (optional)
    const user = searchResults.find(u => u.id === userId);
    if (user) {
      const newRequest: FriendRequest = {
        ...user,
        sentAt: new Date().toISOString().split('T')[0],
        type: 'outgoing'
      };
      setFriendRequests([...friendRequests, newRequest]);
    }
  };

  const cancelFriendRequest = (userId: string) => {
    setSearchResults(searchResults.map(user => 
      user.id === userId ? { ...user, status: 'not_friend' } : user
    ));
    setFriendRequests(friendRequests.filter(r => r.id !== userId));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    searchFriends(query);
  };

  const openUserProfile = (user: Friend | FriendRequest | SearchResult) => {
    // Преобразуем данные пользователя в UserProfileData
    const userProfileData = {
      id: user.id,
      name: user.name,
      points: 'points' in user ? user.points : Math.floor(Math.random() * 1000) + 500,
      level: user.level,
      city: user.city,
      trainingDays: Math.floor(Math.random() * 100) + 20,
      achievements: [
        'Первая тренировка',
        'Месяц без пропусков',
        'Личный рекорд'
      ],
      records: {
        'Жим лежа': Math.floor(Math.random() * 50) + 80,
        'Становая тяга': Math.floor(Math.random() * 80) + 120,
        'Присед': Math.floor(Math.random() * 60) + 100
      },
      recentWorkouts: [
        {
          id: '1',
          title: 'Тренировка груди',
          date: new Date().toISOString(),
          status: 'completed' as const
        }
      ],
      isFriend: 'status' in user ? user.status === 'online' || user.status === 'offline' || user.status === 'training' : false
    };
    
    setSelectedUser(userProfileData);
    setIsProfileModalOpen(true);
  };

  const incomingRequests = friendRequests.filter(r => r.type === 'incoming');
  const outgoingRequests = friendRequests.filter(r => r.type === 'outgoing');

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl">Друзья</h2>
          <p className="text-sm text-muted-foreground">
            Тренируйтесь вместе с друзьями
          </p>
        </div>
        <Button size="sm" onClick={() => setActiveTab('search')}>
          <Plus className="h-4 w-4 mr-2" />
          Найти
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-lg font-semibold text-primary">{friends.length}</p>
            <p className="text-xs text-muted-foreground">Друзей</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-lg font-semibold text-green-600">{friends.filter(f => f.status !== 'offline').length}</p>
            <p className="text-xs text-muted-foreground">Онлайн</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-lg font-semibold text-blue-600">{incomingRequests.length}</p>
            <p className="text-xs text-muted-foreground">Заявок</p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="friends">
            Друзья ({friends.length})
          </TabsTrigger>
          <TabsTrigger value="requests">
            Заявки ({incomingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="search">
            Поиск
          </TabsTrigger>
        </TabsList>

        {/* Friends List */}
        <TabsContent value="friends" className="mt-4">
          <div className="space-y-3">
            {friends.length > 0 ? friends.map(friend => (
              <Card key={friend.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div 
                      className="relative flex-shrink-0 cursor-pointer"
                      onClick={() => openUserProfile(friend)}
                    >
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>
                          {friend.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusColor(friend.status)} rounded-full border-2 border-background`}></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div 
                        className="cursor-pointer"
                        onClick={() => openUserProfile(friend)}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-medium truncate">{friend.name}</p>
                          <Badge variant="outline" className="text-xs">
                            {getStatusLabel(friend.status)}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground mb-3">
                          <span>Уровень {friend.level}</span>
                          <span>•</span>
                          <span>{friend.city}</span>
                          {friend.mutualFriends > 0 && (
                            <>
                              <span>•</span>
                              <span>{friend.mutualFriends} общих</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-7 px-2 text-xs flex-1">
                          <MessageCircle className="h-3 w-3 mr-1" />
                          Чат
                        </Button>
                        <Button variant="outline" size="sm" className="h-7 px-2 text-xs flex-1">
                          <Calendar className="h-3 w-3 mr-1" />
                          Позвать
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">У вас пока нет друзей</p>
                  <Button onClick={() => setActiveTab('search')}>
                    <Search className="h-4 w-4 mr-2" />
                    Найти друзей
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Friend Requests */}
        <TabsContent value="requests" className="mt-4">
          <div className="space-y-4">
            {incomingRequests.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-3">Входящие заявки</h4>
                <div className="space-y-3">
                  {incomingRequests.map(request => (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                    >
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-start space-x-3">
                            <div 
                              className="relative flex-shrink-0 cursor-pointer"
                              onClick={() => openUserProfile(request)}
                            >
                              <Avatar className="h-12 w-12">
                                <AvatarFallback>
                                  {request.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div 
                                className="cursor-pointer"
                                onClick={() => openUserProfile(request)}
                              >
                                <div className="flex items-center space-x-2 mb-1">
                                  <p className="font-medium truncate">{request.name}</p>
                                  <Badge variant="secondary" className="text-xs">
                                    Уровень {request.level}
                                  </Badge>
                                </div>
                                <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground mb-2">
                                  <span>{request.city} • {request.gym}</span>
                                  {request.mutualFriends > 0 && (
                                    <>
                                      <span>•</span>
                                      <span>{request.mutualFriends} общих</span>
                                    </>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(request.sentAt).toLocaleDateString('ru-RU')}
                                </p>
                              </div>
                              <div className="flex gap-2 mt-3">
                                <Button
                                  onClick={() => acceptFriendRequest(request.id)}
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700 h-7 px-3 text-xs flex-1"
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Принять
                                </Button>
                                <Button
                                  onClick={() => rejectFriendRequest(request.id)}
                                  variant="outline"
                                  size="sm"
                                  className="h-7 px-3 text-xs flex-1"
                                >
                                  <X className="h-3 w-3 mr-1" />
                                  Отклонить
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {outgoingRequests.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-3">Исходящие заявки</h4>
                <div className="space-y-3">
                  {outgoingRequests.map(request => (
                    <Card key={request.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="cursor-pointer"
                            onClick={() => openUserProfile(request)}
                          >
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="text-sm">
                                {request.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          <div 
                            className="flex-1 cursor-pointer"
                            onClick={() => openUserProfile(request)}
                          >
                            <p className="font-medium">{request.name}</p>
                            <p className="text-xs text-muted-foreground">Заявка отправлена</p>
                          </div>
                          <Button
                            onClick={() => cancelFriendRequest(request.id)}
                            variant="outline"
                            size="sm"
                            className="h-7 px-3 text-xs"
                          >
                            Отменить
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {incomingRequests.length === 0 && outgoingRequests.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Нет заявок в друзья</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Search */}
        <TabsContent value="search" className="mt-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="search">Поиск пользователей</Label>
              <div className="flex space-x-2 mt-1">
                <Input
                  id="search"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Введите имя или никнейм..."
                  className="flex-1"
                />
                <Button variant="outline" size="icon" disabled={isSearching}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Минимум 2 символа для поиска
              </p>
            </div>

            <AnimatePresence>
              {isSearching && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8"
                >
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-sm text-muted-foreground mt-2">Поиск...</p>
                </motion.div>
              )}
            </AnimatePresence>

            {searchResults.length > 0 && !isSearching && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <h4 className="text-sm font-medium">Результаты поиска</h4>
                {searchResults.map(user => (
                  <Card key={user.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="cursor-pointer"
                          onClick={() => openUserProfile(user)}
                        >
                          <Avatar className="h-12 w-12">
                            <AvatarFallback>
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => openUserProfile(user)}
                        >
                          <p className="font-medium">{user.name}</p>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <span>Уровень {user.level}</span>
                            <span>•</span>
                            <span>{user.city}</span>
                            {user.mutualFriends > 0 && (
                              <>
                                <span>•</span>
                                <span>{user.mutualFriends} общих</span>
                              </>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{user.gym}</p>
                        </div>
                        <div className="flex-shrink-0">
                          {user.status === 'not_friend' && (
                            <Button
                              onClick={() => sendFriendRequest(user.id)}
                              size="sm"
                              className="h-7 px-2 text-xs flex items-center gap-1 whitespace-nowrap"
                            >
                              <UserPlus className="h-3 w-3" />
                              <span className="hidden sm:inline">Добавить</span>
                            </Button>
                          )}
                          {user.status === 'request_sent' && (
                            <Button
                              onClick={() => cancelFriendRequest(user.id)}
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs whitespace-nowrap"
                            >
                              <span className="hidden sm:inline">Отменить</span>
                              <span className="sm:hidden">✕</span>
                            </Button>
                          )}
                          {user.status === 'friend' && (
                            <Badge variant="secondary" className="text-xs">Друг</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </motion.div>
            )}

            {searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8"
              >
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Пользователи не найдены</p>
                <p className="text-sm text-muted-foreground">Попробуйте изменить запрос</p>
              </motion.div>
            )}

            {searchQuery.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="font-medium mb-2">Найдите новых друзей</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Введите имя или никнейм пользователя для поиска
                  </p>
                  <div className="space-y-2 text-xs text-muted-foreground">
                    <p>💡 Советы по поиску:</p>
                    <p>• Используйте точное написание имени</p>
                    <p>• Попробуйте найти по никнейму</p>
                    <p>• Проверьте город и зал в профиле</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* User Profile Modal */}
      <UserProfileModal
        user={selectedUser}
        isOpen={isProfileModalOpen}
        onClose={() => {
          setIsProfileModalOpen(false);
          setSelectedUser(null);
        }}
        onSendFriendRequest={(userId) => {
          console.log('Отправить заявку в друзья:', userId);
          // Здесь можно добавить логику отправки заявки в друзья
        }}
      />
    </div>
  );
}