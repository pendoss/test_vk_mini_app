import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Card, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { MapPin } from 'lucide-react';
import { User } from '@/entities/user/model/types';

interface UserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UserModal({ user, isOpen, onClose }: UserModalProps) {
  if (!user) return null;

  const getInitials = (firstName?: string, lastName?: string, name?: string) => {
    if (firstName || lastName) {
      return `${firstName ? firstName[0] : ''}${lastName ? lastName[0] : ''}`.toUpperCase();
    }
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] max-w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Профиль пользователя</DialogTitle>
        </DialogHeader>
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-start space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-lg">
                  {getInitials(user.firstName, user.lastName, user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1 flex-1 min-w-0">
                <CardTitle className="text-lg">{user.firstName || user.name} {user.lastName}</CardTitle>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                  {user.city && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{user.city}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <Badge variant="secondary" className="text-xs">
                    Уровень {user.level}
                  </Badge>
                </div>
                {user.primaryGym && (
                    <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                      <span className="font-semibold">Основной зал: </span>  <strong>{user.primaryGym}</strong>
                    </div>
                )}
                {user.weight && (
                    <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                      <span className="font-semibold">Вес:</span><strong>{user.weight} кг</strong>
                    </div>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>
      </DialogContent>
    </Dialog>
  );
}

