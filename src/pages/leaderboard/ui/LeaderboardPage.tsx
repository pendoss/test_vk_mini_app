import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/ui/card';
import { Badge } from '@/shared/ui/ui/badge';
import { Avatar, AvatarFallback } from '@/shared/ui/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/ui/tabs';
import { Trophy, Medal, Award, TrendingUp, Clock, Calendar } from 'lucide-react';
import { UserProfileModal } from '@/shared/ui/UserProfileModal';

interface User {
  id: string;
  name: string;
  points: number;
  level: number;
}

interface LeaderboardEntry {
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

interface LeaderboardPageProps {
  currentUser: User;
}

export function LeaderboardPage({ currentUser }: LeaderboardPageProps) {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  
  const [leaderboard] = useState<LeaderboardEntry[]>([
    {
      id: '1',
      name: 'Михаил Козлов',
      points: 2850,
      level: 18,
      rank: 1,
      change: 0,
      city: 'Москва',
      gym: 'World Gym',
      todayPoints: 45,
      weekPoints: 320
    },
    {
      id: '2',
      name: 'Елена Смирнова',
      points: 2780,
      level: 17,
      rank: 2,
      change: 1,
      city: 'Санкт-Петербург',
      gym: 'FitnessPark',
      todayPoints: 35,
      weekPoints: 280
    },
    {
      id: '3',
      name: 'Дмитрий Волков',
      points: 2650,
      level: 16,
      rank: 3,
      change: -1,
      city: 'Москва',
      gym: 'Gold Gym',
      todayPoints: 20,
      weekPoints: 250
    },
    {
      id: '4',
      name: 'Анна Петрова',
      points: 2420,
      level: 15,
      rank: 4,
      change: 2,
      city: 'Новосибирск',
      gym: 'Fitness House',
      todayPoints: 30,
      weekPoints: 215
    },
    {
      id: '5',
      name: 'Сергей Иванов',
      points: 2380,
      level: 15,
      rank: 5,
      change: 0,
      city: 'Екатеринбург',
      gym: 'Power Gym',
      todayPoints: 25,
      weekPoints: 200
    },
    {
      id: currentUser.id,  // Используем ID текущего пользователя
      name: currentUser.name,  // Используем имя текущего пользователя
      points: currentUser.points,
      level: currentUser.level,
      rank: 12,
      change: 3,
      city: 'Москва',
      gym: 'FitnessPark Сокольники',
      todayPoints: 40,
      weekPoints: 180
    }
  ]);

  const getTrophyIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Award className="h-5 w-5 text-amber-600" />;
      default: return <span className="text-lg text-muted-foreground">#{rank}</span>;
    }
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (change < 0) return <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />;
    return <span className="text-muted-foreground">—</span>;
  };

  const openUserProfile = (entry: LeaderboardEntry) => {
    // Преобразуем LeaderboardEntry в UserProfileData
    const userProfileData = {
      id: entry.id,
      name: entry.name,
      points: entry.points,
      level: entry.level,
      city: entry.city,
      rank: entry.rank,
      trainingDays: Math.floor(Math.random() * 100) + 20, // mock data
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
        },
        {
          id: '2',
          title: 'Кардио',
          date: new Date(Date.now() - 86400000).toISOString(),
          status: 'completed' as const
        }
      ],
      isFriend: Math.random() > 0.5 // mock
    };
    
    setSelectedUser(userProfileData);
    setIsProfileModalOpen(true);
  };

  const getRankColor = (rank: number, isCurrentUser: boolean) => {
    if (isCurrentUser) return 'border-primary bg-primary/5';
    if (rank <= 3) return 'border-yellow-300 bg-yellow-50';
    if (rank <= 10) return 'border-blue-300 bg-blue-50';
    return 'border-border';
  };

  const topThree = leaderboard.slice(0, 3);
  const others = leaderboard.slice(3);

  return (
    <div className="space-y-6">
      {/* Current User Stats */}
      <Card className="border-primary">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-5 w-5 text-primary" />
            <span>Ваша позиция</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {getTrophyIcon(12)}
              <span className="text-lg">#12</span>
            </div>
            <div>
              <p>{currentUser.name}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-lg">{currentUser.points} баллов</p>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                {getChangeIcon(3)}
                <span>+3 позиции</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Общий</TabsTrigger>
          <TabsTrigger value="today">За день</TabsTrigger>
          <TabsTrigger value="week">За неделю</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {/* Top 3 Podium */}
          <Card>
            <CardHeader>
              <CardTitle>Топ-3 игроков</CardTitle>
              <CardDescription>Лучшие по общему количеству баллов</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-center space-x-8 py-8">
                {/* Second Place */}
                <div 
                  className="flex flex-col items-center space-y-3 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => topThree[1] && openUserProfile(topThree[1])}
                >
                  <Avatar className="h-16 w-16 border-4 border-gray-300">
                    <AvatarFallback className="text-lg">
                      {topThree[1]?.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <p className="font-semibold">{topThree[1]?.name}</p>
                    <p className="text-sm">{topThree[1]?.points} баллов</p>
                  </div>
                  <div className="w-24 h-20 bg-gray-300 rounded-t-lg flex items-center justify-center">
                    <Medal className="h-8 w-8 text-gray-600" />
                  </div>
                  <Badge variant="secondary">2 место</Badge>
                </div>

                {/* First Place */}
                <div 
                  className="flex flex-col items-center space-y-3 -mt-8 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => topThree[0] && openUserProfile(topThree[0])}
                >
                  <Avatar className="h-20 w-20 border-4 border-yellow-400">
                    <AvatarFallback className="text-xl">
                      {topThree[0]?.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <p className="font-semibold">{topThree[0]?.name}</p>
                    <p className="text-sm">{topThree[0]?.points} баллов</p>
                  </div>
                  <div className="w-28 h-28 bg-yellow-400 rounded-t-lg flex items-center justify-center">
                    <Trophy className="h-10 w-10 text-yellow-700" />
                  </div>
                  <Badge className="bg-yellow-500">1 место</Badge>
                </div>

                {/* Third Place */}
                <div 
                  className="flex flex-col items-center space-y-3 cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => topThree[2] && openUserProfile(topThree[2])}
                >
                  <Avatar className="h-16 w-16 border-4 border-amber-500">
                    <AvatarFallback className="text-lg">
                      {topThree[2]?.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-center">
                    <p className="font-semibold">{topThree[2]?.name}</p>
                    <p className="text-sm">{topThree[2]?.points} баллов</p>
                  </div>
                  <div className="w-24 h-16 bg-amber-500 rounded-t-lg flex items-center justify-center">
                    <Award className="h-8 w-8 text-amber-700" />
                  </div>
                  <Badge variant="outline" className="border-amber-500">3 место</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Остальные участники */}
          <Card>
            <CardHeader>
              <CardTitle>Остальные участники</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {others.map(entry => (
                  <div
                    key={entry.id}
                    onClick={() => entry.id !== currentUser.id && openUserProfile(entry)}
                    className={`
                      flex items-center space-x-4 p-4 rounded-lg border transition-colors
                      ${getRankColor(entry.rank, entry.id === currentUser.id)}
                      ${entry.id !== currentUser.id ? 'cursor-pointer hover:bg-muted/50' : ''}
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      {getTrophyIcon(entry.rank)}
                      <Avatar>
                        <AvatarFallback>
                          {entry.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{entry.name}</p>
                        {entry.id === currentUser.id && <Badge variant="outline">Вы</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{entry.city} • {entry.gym}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-semibold">{entry.points.toLocaleString()} баллов</p>
                      <p className="text-xs text-muted-foreground">Уровень {entry.level}</p>
                      <div className="flex items-center space-x-1 text-xs">
                        {getChangeIcon(entry.change)}
                        <span className={`
                          ${entry.change > 0 ? 'text-green-600' : entry.change < 0 ? 'text-red-600' : 'text-muted-foreground'}
                        `}>
                          {entry.change > 0 ? `+${entry.change}` : entry.change < 0 ? entry.change : '0'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="today" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span>Лидерборд за сегодня</span>
              </CardTitle>
              <CardDescription>Рейтинг по баллам, набранным сегодня</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard
                  .sort((a, b) => b.todayPoints - a.todayPoints)
                  .map((entry, index) => (
                    <div
                      key={entry.id}
                      onClick={() => entry.id !== currentUser.id && openUserProfile(entry)}
                      className={`
                        flex items-center space-x-4 p-4 rounded-lg border transition-colors
                        ${entry.id === currentUser.id ? 'border-primary bg-primary/5' : 'border-border'}
                        ${entry.id !== currentUser.id ? 'cursor-pointer hover:bg-muted/50' : ''}
                      `}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg text-muted-foreground w-8">#{index + 1}</span>
                        <Avatar>
                          <AvatarFallback>
                            {entry.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{entry.name}</p>
                          {entry.id === currentUser.id && <Badge variant="outline">Вы</Badge>}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold">{entry.todayPoints} баллов</p>
                        <p className="text-xs text-muted-foreground">сегодня</p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="week" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Лидерборд за неделю</span>
              </CardTitle>
              <CardDescription>Рейтинг по баллам, набранным за последнюю неделю</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard
                  .sort((a, b) => b.weekPoints - a.weekPoints)
                  .map((entry, index) => (
                    <div
                      key={entry.id}
                      onClick={() => entry.id !== currentUser.id && openUserProfile(entry)}
                      className={`
                        flex items-center space-x-4 p-4 rounded-lg border transition-colors
                        ${entry.id === currentUser.id ? 'border-primary bg-primary/5' : 'border-border'}
                        ${entry.id !== currentUser.id ? 'cursor-pointer hover:bg-muted/50' : ''}
                      `}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg text-muted-foreground w-8">#{index + 1}</span>
                        <Avatar>
                          <AvatarFallback>
                            {entry.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="font-medium">{entry.name}</p>
                          {entry.id === currentUser.id && <Badge variant="outline">Вы</Badge>}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-semibold">{entry.weekPoints} баллов</p>
                        <p className="text-xs text-muted-foreground">за неделю</p>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
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