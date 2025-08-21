import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/ui/card';
import { Badge } from '@/shared/ui/ui/badge';
import { Avatar, AvatarFallback } from '@/shared/ui/ui/avatar';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { UserProfileModal } from '@/shared/ui/UserProfileModal';
import { userApi } from '@/entities/user';
import { User } from "@/entities/user";
import {ScreenSpinner} from "@vkontakte/vkui";

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

interface LeaderboardPageProps {
  currentUser: User;
}
export interface UserProfileData extends LeaderboardEntry{
  rank: number;
  trainingDays: number;
  achievements: string[];
}

export function LeaderboardPage({ currentUser }: LeaderboardPageProps) {
  const [selectedUser, setSelectedUser] = useState<UserProfileData | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userApi.getLeaderboardUsers({ limit: 30 });
      const items = response.items;
      const leaderboardEntries: LeaderboardEntry[] = items.map((user, idx) => ({
        id: user.id,
        name: user.name,
        points: user.point ?? 0,
        level: user.level ?? 0,
        rank: idx + 1,
        change: 0, // No backend info, default to 0
        city: user.city ?? '',
        gym: user.primaryGym ?? '',
        todayPoints: 0, // No backend info, default to 0
        weekPoints: 0, // No backend info, default to 0
        avatar: user.avatar ?? undefined,
      }));
      setLeaderboard(leaderboardEntries);
    } catch (err) {
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

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
    const userProfileData = {
      ...entry,
      trainingDays: Math.floor(Math.random() * 100) + 20, // mock data
      achievements: [],
      records: {},
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

  if(loading) {
    return (<ScreenSpinner/>)
  }
  if (error) {
    return (<p>Error</p>)
  }

  return (
    <div className="space-y-6">
      {/* Current User Stats */}
      <Card className="border-primary">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <span><strong>Ваша позиция</strong></span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {getTrophyIcon(leaderboard.find((entry) => entry.id === currentUser.id)?.rank || 0)}
            </div>
            <div>
              <p>{currentUser.name}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-lg">{currentUser.point} баллов</p>
            </div>
          </div>
        </CardContent>
      </Card>
          <Card>
            <CardHeader>
              <CardTitle>Топ-3 игроков</CardTitle>
              <CardDescription>Лучшие по общему количеству баллов</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-center space-x-5 py-8">
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
      
      {/* User Profile Modal */}
      {selectedUser &&
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
      }

    </div>
  );
}