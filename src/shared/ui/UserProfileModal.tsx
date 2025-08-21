import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { MapPin, Trophy } from 'lucide-react';
import {UserProfileData} from "@/pages/leaderboard/ui/LeaderboardPage.tsx";


interface UserProfileModalProps {
  user: UserProfileData | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UserProfileModal({ user, isOpen, onClose }: UserProfileModalProps) {

  if (!user) return null;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Профиль пользователя</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 max-w-[80vw]">
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
                    {user.rank !== undefined && (
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
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Дней тренировок</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-semibold text-center">
                {user.trainingDays ?? 0}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
