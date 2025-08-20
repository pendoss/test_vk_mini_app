import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/ui/card';
import { Badge } from '@/shared/ui/ui/badge';
import { Button } from '@/shared/ui/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/ui/dialog';
import { Input } from '@/shared/ui/ui/input';
import { Label } from '@/shared/ui/ui/label';
import { Textarea } from '@/shared/ui/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/ui/select';
import { Calendar, MapPin, Trophy, Users, Plus } from 'lucide-react';
import {User} from "@/entities/user";


interface UserProfile {
  fullName: string;
  birthDate: string | null;
  weight: number;
  city: string;
  primaryGym: string;
  records: Record<string, number>;
  upcomingWorkouts: WorkoutPlan[];
}

interface WorkoutPlan {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  friends: string[];
  afterWorkout: string;
}

interface ProfilePageProps {
  currentUser: User;
}

export function ProfilePage({ currentUser }: ProfilePageProps) {
  // Функция для форматирования даты рождения из VK API
  const formatBirthDate = (bdate: string | null): string => {
    if (!bdate) return 'Не указана';

    // VK может возвращать формат DD.MM.YYYY или DD.MM
    const parts = bdate.split('.');
    if (parts.length === 3) {
      // Полная дата DD.MM.YYYY
      return `${parts[0]}.${parts[1]}.${parts[2]}`;
    } else if (parts.length === 2) {
      // Только день и месяц DD.MM
      return `${parts[0]}.${parts[1]}`;
    }

    return bdate;
  };

  const [profile, setProfile] = useState<UserProfile>({
    fullName: currentUser.name,
    birthDate: currentUser.birthDate || null,
    weight: currentUser.weight,
    city: currentUser.city || "не указан",
    primaryGym: currentUser.primaryGym || "не указан",
    records: {
      'Жим лежа': 120,
      'Становая тяга': 180,
      'Присед': 150,
      'Подтягивания с весом': 25,
      'Строгий подъем на бицепс': 45
    },
    upcomingWorkouts: [
      {
        id: '1',
        title: 'День груди и трицепса',
        description: 'Интенсивная тренировка верха тела',
        date: '2025-01-20',
        time: '18:00',
        location: 'FitnessPark Сокольники',
        friends: ['Михаил К.', 'Дмитрий С.'],
        afterWorkout: 'Постою поболтаю с ребятами из зала'
      },
      {
        id: '2',
        title: 'Кардио и пресс',
        description: 'Легкая восстановительная тренировка',
        date: '2025-01-22',
        time: '07:00',
        location: 'FitnessPark Сокольники',
        friends: [],
        afterWorkout: 'Бегу домой'
      }
    ]
  });

  // Обновляем профиль при изменении данных пользователя
  useEffect(() => {
    setProfile(prev => ({
      ...prev,
      fullName: currentUser.name,
      birthDate: currentUser.birthDate || null,
      city: currentUser.city || prev.city,
    }));
  }, [currentUser]);

  const [isCreatingWorkout, setIsCreatingWorkout] = useState(false);
  const [newWorkout, setNewWorkout] = useState<Partial<WorkoutPlan>>({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    friends: [],
    afterWorkout: 'Бегу домой'
  });

  const createWorkout = () => {
    if (newWorkout.title && newWorkout.date && newWorkout.time) {
      const workout: WorkoutPlan = {
        id: Date.now().toString(),
        title: newWorkout.title,
        description: newWorkout.description || '',
        date: newWorkout.date,
        time: newWorkout.time,
        location: newWorkout.location || 'FitnessPark Сокольники',
        friends: newWorkout.friends || [],
        afterWorkout: newWorkout.afterWorkout || 'Бегу домой'
      };

      setProfile({
        ...profile,
        upcomingWorkouts: [...profile.upcomingWorkouts, workout]
      });

      setNewWorkout({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        friends: [],
        afterWorkout: 'Бегу домой'
      });
      setIsCreatingWorkout(false);
    }
  };

  return (
    <div className="space-y-4 p-4">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              {currentUser.avatar && (
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
              )}
              <AvatarFallback className="text-lg bg-primary text-primary-foreground">
                {profile.fullName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1 flex-1">
              <CardTitle className="text-lg">{profile.fullName}</CardTitle>
              <CardDescription>Дата рождения: {formatBirthDate(profile.birthDate)}</CardDescription>
              <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span>{profile.city}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Trophy className="h-3 w-3" />
                  <span>Уровень {currentUser.level}</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Вес</p>
              <p>{profile.weight} кг</p>
            </div>
            <div>
              <p className="text-muted-foreground">Основной зал</p>
              <p className="truncate">{profile.primaryGym}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Баллы</p>
              {/*<p>{currentUser.points}</p>*/}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="records" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="records">Рекорды</TabsTrigger>
          <TabsTrigger value="workouts">Тренировки</TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="space-y-3 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Личные рекорды</CardTitle>
              <CardDescription>Ваши лучшие результаты</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(profile.records).map(([exercise, weight]) => (
                  <div key={exercise} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{exercise}</p>
                      <p className="text-xs text-muted-foreground">Максимальный вес</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{weight} кг</p>
                      <Badge variant="secondary" className="text-xs">ПР</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workouts" className="space-y-3 mt-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Запланированные</h4>
            <Dialog open={isCreatingWorkout} onOpenChange={setIsCreatingWorkout}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-3 w-3 mr-1" />
                  Создать
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Новая тренировка</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="details" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="details">Основное</TabsTrigger>
                    <TabsTrigger value="plan">План тренировки</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-4 mt-4">
                    <div>
                      <Label htmlFor="title">Название</Label>
                      <Input
                        id="title"
                        value={newWorkout.title || ''}
                        onChange={(e) => setNewWorkout({ ...newWorkout, title: e.target.value })}
                        placeholder="Например: День ног"
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Описание</Label>
                      <Textarea
                        id="description"
                        value={newWorkout.description || ''}
                        onChange={(e) => setNewWorkout({ ...newWorkout, description: e.target.value })}
                        placeholder="Краткое описание тренировки"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="date">Дата</Label>
                        <Input
                          id="date"
                          type="date"
                          value={newWorkout.date || ''}
                          onChange={(e) => setNewWorkout({ ...newWorkout, date: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="time">Время</Label>
                        <Input
                          id="time"
                          type="time"
                          value={newWorkout.time || ''}
                          onChange={(e) => setNewWorkout({ ...newWorkout, time: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="location">Место</Label>
                      <Input
                        id="location"
                        value={newWorkout.location || ''}
                        onChange={(e) => setNewWorkout({ ...newWorkout, location: e.target.value })}
                        placeholder="Название зала"
                      />
                    </div>

                    <div>
                      <Label htmlFor="afterWorkout">После тренировки</Label>
                      <Select
                        value={newWorkout.afterWorkout}
                        onValueChange={(value) => setNewWorkout({ ...newWorkout, afterWorkout: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Бегу домой">Бегу домой</SelectItem>
                          <SelectItem value="Иду на работу">Иду на работу</SelectItem>
                          <SelectItem value="Постою поболтаю с ребятами из зала">Постою поболтаю с ребятами из зала</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>

                  <TabsContent value="plan" className="space-y-4 mt-4">
                    <div>
                      <Label>План тренировки</Label>
                      <Textarea
                        value={newWorkout.description || ''}
                        onChange={(e) => setNewWorkout({ ...newWorkout, description: e.target.value })}
                        placeholder="Опишите план тренировки: упражнения, подходы, повторения..."
                        rows={8}
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsCreatingWorkout(false)}>
                    Отмена
                  </Button>
                  <Button onClick={createWorkout}>
                    Создать
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {profile.upcomingWorkouts.map(workout => (
              <Card key={workout.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h5 className="text-sm font-medium">{workout.title}</h5>
                      <p className="text-xs text-muted-foreground">{workout.description}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {new Date(workout.date).toLocaleDateString('ru-RU')}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{workout.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{workout.time}</span>
                    </div>
                    {workout.friends.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>{workout.friends.length}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}