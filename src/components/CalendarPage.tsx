import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ChevronLeft, ChevronRight, Calendar, MapPin, Clock, Users, Plus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WorkoutPlan {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  estimatedDuration: number;
  friends: string[];
  afterWorkout: string;
  status: 'planned' | 'completed' | 'cancelled';
  createdAt: string;
  createdBy: string;
}

interface User {
  id: string;
  name: string;
  points: number;
  level: number;
}

interface CalendarPageProps {
  workouts: WorkoutPlan[];
  currentUser: User;
  onAddWorkout: (workout: Omit<WorkoutPlan, 'id' | 'createdAt' | 'createdBy'>) => WorkoutPlan;
  onUpdateWorkout: (workoutId: string, updates: Partial<WorkoutPlan>) => void;
  onDeleteWorkout: (workoutId: string) => void;
}

export function CalendarPage({ workouts, currentUser, onAddWorkout, onUpdateWorkout, onDeleteWorkout }: CalendarPageProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 0, 18)); // January 18, 2025
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutPlan | null>(null);
  const [isCreatingWorkout, setIsCreatingWorkout] = useState(false);
  const [quickCreateDate, setQuickCreateDate] = useState<string>('');
  
  const [newWorkout, setNewWorkout] = useState<Partial<WorkoutPlan>>({
    title: '',
    description: '',
    date: '',
    time: '',
    location: 'FitnessPark Сокольники',
    estimatedDuration: 60,
    friends: [],
    afterWorkout: 'Бегу домой',
    status: 'planned'
  });

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1; // Convert to Monday = 0 format
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
    return workouts.filter(event => event.date === dateStr);
  };

  const getDateStatus = (day: number) => {
    const dayWorkouts = getWorkoutsForDate(day);
    if (dayWorkouts.length === 0) return null;
    
    if (dayWorkouts.some(w => w.status === 'planned')) return 'planned';
    if (dayWorkouts.some(w => w.status === 'completed')) return 'completed';
    if (dayWorkouts.some(w => w.status === 'cancelled')) return 'cancelled';
    return null;
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dayWorkouts = getWorkoutsForDate(day);
    
    if (dayWorkouts.length === 0) {
      // No workouts - show quick create option
      const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      setQuickCreateDate(dateStr);
      setNewWorkout({
        ...newWorkout,
        date: dateStr,
        time: '18:00'
      });
      setIsCreatingWorkout(true);
    } else {
      // Has workouts - show day details
      setSelectedDate(clickedDate);
    }
  };

  const createWorkout = () => {
    if (!newWorkout.title || !newWorkout.date || !newWorkout.time) return;

    onAddWorkout({
      title: newWorkout.title!,
      description: newWorkout.description || '',
      date: newWorkout.date!,
      time: newWorkout.time!,
      location: newWorkout.location!,
      estimatedDuration: newWorkout.estimatedDuration || 60,
      friends: newWorkout.friends || [],
      afterWorkout: newWorkout.afterWorkout || 'Бегу домой',
      status: 'planned'
    });

    setNewWorkout({
      title: '',
      description: '',
      date: '',
      time: '',
      location: 'FitnessPark Сокольники',
      estimatedDuration: 60,
      friends: [],
      afterWorkout: 'Бегу домой',
      status: 'planned'
    });
    setIsCreatingWorkout(false);
    setQuickCreateDate('');
  };

  const addWorkoutToDate = (dateStr: string) => {
    setNewWorkout({
      ...newWorkout,
      date: dateStr,
      time: '18:00'
    });
    setIsCreatingWorkout(true);
    setSelectedDate(null);
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const status = getDateStatus(day);
      const workoutsCount = getWorkoutsForDate(day).length;
      const todayClass = isToday(day) ? 'bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2' : '';
      const statusClass = status ? {
        'planned': 'bg-blue-100 text-blue-900 border border-blue-300',
        'completed': 'bg-green-100 text-green-900 border border-green-300',
        'cancelled': 'bg-red-100 text-red-900 border border-red-300'
      }[status] : 'hover:bg-muted';

      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(day)}
          className={`
            p-2 h-12 flex flex-col items-center justify-center rounded-lg cursor-pointer transition-all text-sm relative
            ${todayClass || statusClass}
          `}
        >
          <span>{day}</span>
          {workoutsCount > 0 && (
            <div className="absolute bottom-0.5 right-0.5">
              <div className="w-2 h-2 bg-current rounded-full opacity-60"></div>
              {workoutsCount > 1 && (
                <div className="absolute -top-0.5 -left-0.5 w-1.5 h-1.5 bg-current rounded-full"></div>
              )}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const getTypeColor = (status: WorkoutPlan['status']) => {
    switch (status) {
      case 'planned': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
    }
  };

  const getTypeLabel = (status: WorkoutPlan['status']) => {
    switch (status) {
      case 'planned': return 'Запланировано';
      case 'completed': return 'Выполнено';
      case 'cancelled': return 'Отменено';
    }
  };

  const selectedDateWorkouts = selectedDate ? getWorkoutsForDate(selectedDate.getDate()) : [];
  const upcomingWorkouts = workouts
    .filter(w => w.status === 'planned' && new Date(w.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  // Simple markdown renderer for basic formatting
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

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
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
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Week day headers */}
            {weekDays.map(day => (
              <div key={day} className="p-2 text-center text-sm text-muted-foreground font-medium">
                {day}
              </div>
            ))}
            
            {/* Calendar days */}
            {renderCalendarDays()}
          </div>

          {/* Legend */}
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

      {/* Upcoming Workouts */}
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
                  <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(workout.date).toLocaleDateString('ru-RU')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{workout.time}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{workout.location}</span>
                    </div>
                    {workout.friends.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>{workout.friends.length}</span>
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

      {/* Selected Day Modal */}
      <AnimatePresence>
        {selectedDate && (
          <Dialog open={!!selectedDate} onOpenChange={() => setSelectedDate(null)}>
            <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
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
              <div className="space-y-4">
                {selectedDateWorkouts.length > 0 ? (
                  <>
                    {selectedDateWorkouts.map(workout => (
                      <Card key={workout.id} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Добавляем небольшую задержку для плавного перехода между модальными окнами
                        setSelectedDate(null);
                        setTimeout(() => {
                          setSelectedWorkout(workout);
                        }, 100);
                      }}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-medium">{workout.title}</h4>
                              <p className="text-sm text-muted-foreground line-clamp-2">{workout.description}</p>
                            </div>
                            <Badge className={getTypeColor(workout.status)}>
                              {getTypeLabel(workout.status)}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{workout.time}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-4 w-4" />
                              <span>{workout.location}</span>
                            </div>
                            {workout.friends.length > 0 && (
                              <div className="flex items-center space-x-1">
                                <Users className="h-4 w-4" />
                                <span>{workout.friends.length} друзей</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    <Button 
                      onClick={() => addWorkoutToDate(selectedDate.toISOString().split('T')[0])}
                      variant="outline" 
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Добавить еще одну тренировку
                    </Button>
                  </>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    На этот день тренировки не запланированы
                  </p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Workout Detail Modal */}
      <Dialog open={!!selectedWorkout} onOpenChange={() => setSelectedWorkout(null)}>
        <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-hidden p-0">
          <DialogHeader className="flex-shrink-0 p-4 border-b">
            <DialogTitle className="text-lg font-semibold">
              {selectedWorkout?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {selectedWorkout && (
              <>
                {/* Basic Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{new Date(selectedWorkout.date).toLocaleDateString('ru-RU')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedWorkout.time}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedWorkout.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedWorkout.friends.length} друзей</span>
                  </div>
                </div>

                <Badge className={getTypeColor(selectedWorkout.status)}>
                  {getTypeLabel(selectedWorkout.status)}
                </Badge>

                {/* Description */}
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

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                  {selectedWorkout.status === 'planned' && (
                    <Button
                      onClick={() => {
                        onUpdateWorkout(selectedWorkout.id, { status: 'completed' });
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
                      onDeleteWorkout(selectedWorkout.id);
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

      {/* Create Workout Modal */}
      <AnimatePresence>
        {isCreatingWorkout && (
          <Dialog open={isCreatingWorkout} onOpenChange={setIsCreatingWorkout}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Новая тренировка</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
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
}