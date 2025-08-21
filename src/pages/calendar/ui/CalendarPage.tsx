import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { workoutStore } from '@/entities/workout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/ui/card';
import { Badge } from '@/shared/ui/ui/badge';
import { Button } from '@/shared/ui/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/ui/dialog';
import { Input } from '@/shared/ui/ui/input';
import { Label } from '@/shared/ui/ui/label';
import { Textarea } from '@/shared/ui/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/ui/select';
import { ChevronLeft, ChevronRight, Calendar, MapPin, Clock, Users } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { User, userStore } from '@/entities/user';
import { WorkoutPlan } from '@/entities/workout/model/types';

interface CalendarPageProps {
  currentUser: User;
}

const monthNames = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

const CalendarPage = observer(({ currentUser }: CalendarPageProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutPlan | null>(null);
  const [isCreatingWorkout, setIsCreatingWorkout] = useState(false);
  
  const [newWorkout, setNewWorkout] = useState<Partial<WorkoutPlan>>({
    title: '',
    description: '',
    date: '',
    time: '',
    location: 'FitnessPark Сокольники',
    estimatedDuration: 60,
    participants: [],
    afterWorkout: 'Бегу домой',
    status: 'planned'
  });

  const workouts = workoutStore.workouts;

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1;
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const getWorkoutsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayWorkouts = workouts.filter(event => {
      const eventDate = new Date(event.date);
      const compareDate = new Date(dateStr);
      return (
        eventDate.getFullYear() === compareDate.getFullYear() &&
        eventDate.getMonth() === compareDate.getMonth() &&
        eventDate.getDate() === compareDate.getDate()
      );
    });
    return {
      my: dayWorkouts.filter(w => w.creator_id === currentUser.id),
      others: dayWorkouts.filter(w => w.creator_id !== currentUser.id)
    };
  };

  const selectedDateWorkouts = selectedDate ? getWorkoutsForDate(selectedDate.getDate()) : { my: [], others: [] };
  const upcomingWorkouts = workouts
    .filter(w => w.status === 'planned' && new Date(w.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);
  const renderMarkdown = (markdown: string) => {
    return markdown
      .replace(/^# (.*$)/gim, '<h4 class="text-base font-semibold mb-2 text-primary">$1</h4>')
      .replace(/^## (.*$)/gim, '<h5 class="text-sm font-medium mb-2">$1</h5>')
      .replace(/^\* (.*$)/gim, '<li class="ml-4 text-sm">• $1</li>')
      .replace(/^- (.*$)/gim, '<li class="ml-4 text-sm">• $1</li>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br />');
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const { my, others } = getWorkoutsForDate(day);
      const hasWorkouts = my.length > 0 || others.length > 0;
      const todayClass = isToday(day) ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2' : '';
      const workoutClass = hasWorkouts ? 'bg-blue-50 ring-2 ring-blue-300' : '';
      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(day)}
          className={`p-2 h-12 flex flex-col items-center justify-center rounded-lg cursor-pointer transition-all text-sm relative ${todayClass} ${workoutClass}`}
        >
          <span>{day}</span>
          {my.length > 0 && (
            <div className="absolute bottom-0.5 left-0.5">
              <div className="w-2 h-2 bg-blue-500 rounded-full opacity-80"></div>
            </div>
          )}
          {others.length > 0 && (
            <div className="absolute bottom-0.5 right-0.5">
              <div className="w-2 h-2 bg-orange-400 rounded-full opacity-80"></div>
            </div>
          )}
        </div>
      );
    }
    return days;
  };

  const handleDateClick = (day: number) => {
    setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
  };

  const getTypeColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-800 border border-blue-300';
      case 'completed': return 'bg-green-100 text-green-800 border border-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border border-red-300';
      default: return 'bg-muted text-muted-foreground border';
    }
  };

  const getTypeLabel = (status: string) => {
    switch (status) {
      case 'planned': return 'Запланировано';
      case 'completed': return 'Выполнено';
      case 'cancelled': return 'Отменено';
      default: return 'Неизвестно';
    }
  };

  const createWorkout = async () => {
    if (!newWorkout.title || !newWorkout.date || !newWorkout.time) return;
    await workoutStore.createWorkout({
      ...newWorkout,
      creator_id: currentUser.id,
      participants: [],
      status: 'planned',
      id: Math.random().toString(36),
      time: newWorkout.time
    } as WorkoutPlan);
    setIsCreatingWorkout(false);
    setNewWorkout({
      title: '',
      description: '',
      date: '',
      time: '',
      location: 'FitnessPark Сокольники',
      estimatedDuration: 60,
      participants: [],
      afterWorkout: 'Бегу домой',
      status: 'planned'
    });
  };

  const handleAddWorkoutForSelectedDate = () => {
    if (selectedDate) {
      setNewWorkout({
        ...newWorkout,
        date: selectedDate.toISOString().slice(0, 10),
      });
      setIsCreatingWorkout(true);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
              </CardTitle>
              <CardDescription>Ваши тренировки</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => navigateMonth(-1)}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateMonth(1)}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map(day => (
              <div key={day} className="p-2 text-center text-sm text-muted-foreground font-medium">
                {day}
              </div>
            ))}
            {renderCalendarDays()}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-6 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary rounded"></div>
              <span>Сегодня</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
              <span>Запланировано</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
              <span>Выполнено</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-muted border rounded"></div>
              <span>Нажмите чтобы добавить</span>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Ближайшие тренировки</CardTitle>
          <CardDescription>Ваши запланированные тренировки</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingWorkouts.length > 0 ? upcomingWorkouts.map(workout => (
              <div 
                key={workout.id} 
                className="flex items-center space-x-4 p-3 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setSelectedWorkout(workout)}
              >
                <div className={`w-3 h-3 rounded-full ${getTypeColor(workout.status)}`}></div>
                <div className="flex-1">
                  <p className="font-medium">{workout.title}</p>
                  <div className="flex flex-wrap items-center space-x-2 mt-1 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(workout.date).toLocaleDateString('ru-RU')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{workout.time.slice(0, 5)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span className="break-words max-w-[100px]">{workout.location}</span>
                    </div>
                    {workout.participants.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>{workout.participants.length}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Badge className={getTypeColor(workout.status)}>
                  {getTypeLabel(workout.status)}
                </Badge>
              </div>
            )) : (
              <p className="text-center text-muted-foreground py-4">
                Нет запланированных тренировок
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      <AnimatePresence>
        {selectedDate && (
          <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>
                  {selectedDate.toLocaleDateString('ru-RU', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 flex-1 overflow-y-auto">
                {selectedDateWorkouts.my.length > 0 && (
                  <>
                    <h4 className="font-medium text-blue-600">Мои тренировки</h4>
                    {selectedDateWorkouts.my.map(workout => (
                      <Card key={workout.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => { setSelectedDate(null); setTimeout(() => { setSelectedWorkout(workout); }, 100); }}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-medium">{workout.title}</h4>
                              <p className="text-sm text-muted-foreground line-clamp-2">{workout.description}</p>
                            </div>
                            <Badge className={getTypeColor(workout.status)}>{getTypeLabel(workout.status)}</Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{workout.time ? workout.time.slice(0, 5) : ''}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span>{workout.location}</span>
                            </div>
                            {workout.participants.length > 0 && (
                              <div className="flex items-center space-x-1">
                                <Users className="h-4 w-4" />
                                <span>{workout.participants.length} друзей</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </>
                )}
                {selectedDateWorkouts.others.length > 0 && (
                  <>
                    <h4 className="font-medium text-orange-500">Тренировки других пользователей</h4>
                    {selectedDateWorkouts.others.map(workout => (
                      <Card key={workout.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => { setSelectedDate(null); setTimeout(() => { setSelectedWorkout(workout); }, 100); }}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-medium">{workout.title}</h4>
                              <p className="text-sm text-muted-foreground line-clamp-2">{workout.description}</p>
                            </div>
                            <Badge className={getTypeColor(workout.status)}>{getTypeLabel(workout.status)}</Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{workout.time ? workout.time.slice(0, 5) : ''}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span>{workout.location}</span>
                            </div>
                            {workout.participants.length > 0 && (
                              <div className="flex items-center space-x-1">
                                <Users className="h-4 w-4" />
                                <span>{workout.participants.length} друзей</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </>
                )}
                {selectedDateWorkouts.my.length === 0 && selectedDateWorkouts.others.length === 0 && (
                  <div className="flex flex-col items-center gap-2 py-6">
                    <span className="text-muted-foreground text-sm">Нет тренировок на этот день</span>
                    <Button size="sm" onClick={handleAddWorkoutForSelectedDate}>
                      Добавить тренировку
                    </Button>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
      <Dialog open={!!selectedWorkout} onOpenChange={() => setSelectedWorkout(null)}>
        <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto p-0">
          <DialogHeader className="flex-shrink-0 p-4 border-b">
            <DialogTitle className="text-lg font-semibold">
              {selectedWorkout?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {selectedWorkout && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{new Date(selectedWorkout.date).toLocaleDateString('ru-RU')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedWorkout?.time ? selectedWorkout.time.slice(0, 5) : ''}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedWorkout.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedWorkout.participants.length} друзей</span>
                  </div>
                </div>

                <Badge className={getTypeColor(selectedWorkout.status)}>
                  {getTypeLabel(selectedWorkout.status)}
                </Badge>
                {selectedWorkout.description && (
                  <div>
                    <h4 className="font-medium mb-2">План тренировки</h4>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div 
                        className="prose prose-sm max-w-none text-sm"
                        dangerouslySetInnerHTML={{ 
                          __html: renderMarkdown(selectedWorkout.description) 
                        }}
                      />
                    </div>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                  {selectedWorkout.status === 'planned' && selectedWorkout.creator_id !== currentUser.id && !selectedWorkout.participants.some((p: User) => p.id === currentUser.id) && (
                    <Button
                      onClick={async () => {
                        await workoutStore.updateWorkout(selectedWorkout.id, {
                          ...selectedWorkout,
                          participants: [...selectedWorkout.participants, currentUser]
                        });
                        setSelectedWorkout({
                          ...selectedWorkout,
                          participants: [...selectedWorkout.participants, currentUser]
                        });
                        if(userStore.user) {
                          await userStore.updateUserStats("totalWorkouts", 1);
                          await userStore.updateUserStats("workoutsWithFriends", 1);
                        }
                       }}
                      size="sm"
                      className="bg-orange-500 hover:bg-orange-600 flex-1"
                    >
                      Записаться
                    </Button>
                  )}
                  {selectedWorkout.status === 'planned' && (
                    <Button
                      onClick={() => {
                        workoutStore.updateWorkout(selectedWorkout.id, { ...selectedWorkout, status: 'completed' });
                        setSelectedWorkout(null);
                      }}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 flex-1"
                    >
                      Отметить выполненной
                    </Button>
                  )}
                  <Button
                    onClick={() => {
                      workoutStore.deleteWorkout(selectedWorkout.id);
                      setSelectedWorkout(null);
                    }}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 flex-1 sm:flex-initial"
                  >
                    Удалить
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground">
                  После тренировки: {selectedWorkout.afterWorkout}
                </p>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <AnimatePresence>
        {isCreatingWorkout && (
          <Dialog open={isCreatingWorkout} onOpenChange={setIsCreatingWorkout}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Новая тренировка</DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="title">Название тренировки</Label>
                  <Input
                    id="title"
                    value={newWorkout.title || ''}
                    onChange={(e) => setNewWorkout({ ...newWorkout, title: e.target.value })}
                    placeholder="Например: День ног"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Описание тренировки</Label>
                  <Textarea
                    id="description"
                    value={newWorkout.description || ''}
                    onChange={(e) => setNewWorkout({ ...newWorkout, description: e.target.value })}
                    placeholder="Опишите план тренировки..."
                    className="min-h-24"
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
                  <Label htmlFor="location">Место проведения</Label>
                  <Input
                    id="location"
                    value={newWorkout.location || ''}
                    onChange={(e) => setNewWorkout({ ...newWorkout, location: e.target.value })}
                    placeholder="Название зала"
                  />
                </div>

                <div>
                  <Label htmlFor="duration">Примерная длительность (мин)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newWorkout.estimatedDuration || 60}
                    onChange={(e) => setNewWorkout({ ...newWorkout, estimatedDuration: Number(e.target.value) })}
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

                <div className="flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setIsCreatingWorkout(false)}>
                    Отмена
                  </Button>
                  <Button onClick={createWorkout} disabled={!newWorkout.title || !newWorkout.date || !newWorkout.time}>
                    Создать тренировку
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
});

export { CalendarPage };
