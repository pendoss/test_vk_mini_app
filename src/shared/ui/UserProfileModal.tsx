import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { MapPin, Trophy, Users, UserPlus, Calendar, Clock } from 'lucide-react';

interface User {
  id: string;
  name: string;
  points: number;
  level: number;
  avatar?: string;
  city?: string;
}

interface UserProfileData extends User {
  rank?: number;
  trainingDays: number;
  achievements: string[];
  records: Record<string, number>;
  recentWorkouts: Array<{
    id: string;
    title: string;
    date: string;
    status: 'completed' | 'planned';
  }>;
  isFriend: boolean;
}

interface UserProfileModalProps {
  user: UserProfileData | null;
  isOpen: boolean;
  onClose: () => void;
  onSendFriendRequest?: (userId: string) => void;
}

export function UserProfileModal({ user, isOpen, onClose, onSendFriendRequest }: UserProfileModalProps) {
  const [isRequestSent, setIsRequestSent] = useState(false);

  if (!user) return null;

  const handleSendFriendRequest = () => {
    if (onSendFriendRequest) {
      onSendFriendRequest(user.id);
      setIsRequestSent(true);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Профиль пользователя</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-lg">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1 flex-1 min-w-0">
                  <CardTitle className="text-lg">{user.name}</CardTitle>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                    {user.city && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{user.city}</span>
                      </div>
                    )}
                    {user.rank && (
                      <div className="flex items-center space-x-1">
                        <Trophy className="h-3 w-3" />
                        <span>#{user.rank} в рейтинге</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 pt-2">
                    <Badge variant="secondary" className="text-xs">
                      Уровень {user.level}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {user.points} очков
                    </Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            {!user.isFriend && (
              <CardContent className="pt-0">
                <Button 
                  onClick={handleSendFriendRequest}
                  disabled={isRequestSent}
                  className="w-full"
                  variant={isRequestSent ? "outline" : "default"}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {isRequestSent ? 'Заявка отправлена' : 'Добавить в друзья'}
                </Button>
              </CardContent>
            )}
          </Card>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xl font-semibold text-primary">{user.trainingDays}</p>
                <p className="text-xs text-muted-foreground">Дней тренировок</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xl font-semibold text-blue-600">{user.achievements.length}</p>
                <p className="text-xs text-muted-foreground">Достижений</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-xl font-semibold text-orange-600">{Object.keys(user.records).length}</p>
                <p className="text-xs text-muted-foreground">Рекордов</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="achievements" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="achievements">Достижения</TabsTrigger>
              <TabsTrigger value="records">Рекорды</TabsTrigger>
              <TabsTrigger value="workouts">Тренировки</TabsTrigger>
            </TabsList>

            <TabsContent value="achievements" className="space-y-3 mt-4">
              {user.achievements.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">Достижения пока отсутствуют</p>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {user.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                      <Trophy className="h-5 w-5 text-yellow-500" />
                      <span className="text-sm font-medium">{achievement}</span>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="records" className="space-y-3 mt-4">
              {Object.keys(user.records).length === 0 ? (
                <p className="text-center text-muted-foreground py-4">Рекорды пока не установлены</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(user.records).map(([exercise, record]) => (
                    <div key={exercise} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm font-medium">{exercise}</span>
                      <Badge variant="outline">{record} кг</Badge>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="workouts" className="space-y-3 mt-4">
              {user.recentWorkouts.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">Недавние тренировки отсутствуют</p>
              ) : (
                <div className="space-y-2">
                  {user.recentWorkouts.map((workout) => (
                    <div key={workout.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{workout.title}</p>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(workout.date).toLocaleDateString('ru-RU')}</span>
                        </div>
                      </div>
                      <Badge 
                        className={workout.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}
                      >
                        {workout.status === 'completed' ? 'Выполнено' : 'Запланировано'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
