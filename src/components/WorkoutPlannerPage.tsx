import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Calendar, MapPin, Clock, Users, Plus, ChevronDown, Copy, Trash2, CheckCircle, FileText, Send, X, Edit } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

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

interface Friend {
  id: string;
  name: string;
  nickname: string;
  status: 'online' | 'offline' | 'training';
}

interface WorkoutPlannerPageProps {
  workouts: WorkoutPlan[];
  currentUser: User;
  onAddWorkout: (workout: Omit<WorkoutPlan, 'id' | 'createdAt' | 'createdBy'>) => WorkoutPlan;
  onUpdateWorkout: (workoutId: string, updates: Partial<WorkoutPlan>) => void;
  onDeleteWorkout: (workoutId: string) => void;
  onSendInvitation: (workout: WorkoutPlan, friendId: string, friendName: string, message?: string) => void;
}

const workoutTemplates = [
  {
    id: 'chest',
    name: 'День груди',
    description: `# Тренировка груди и трицепсов

## Разминка (10 мин)
- Кардио: 5 мин легкий бег
- Динамическая растяжка плеч и груди

## Основная часть (60 мин)
- **Жим лежа**: 4 подхода по 8-10 повторений
- **Жим гантелей на наклонной**: 3x12
- **Разводка гантелей**: 3x15
- **Французский жим**: 3x12
- **Отжимания на брусьях**: 3x8-12

## Заминка (10 мин)
- Растяжка грудных мышц
- Дыхательные упражнения`
  },
  {
    id: 'cardio',
    name: 'Кардио тренировка',
    description: `# Кардио + функциональная тренировка

## Разминка (5 мин)
- Легкая ходьба
- Суставная гимнастика

## Кардио блок (30 мин)
- **Беговая дорожка**: 20 мин в среднем темпе
- **Эллипс**: 10 мин интервалы

## Функциональный блок (15 мин)
- Планка: 3x60 сек
- Приседания: 3x20
- Отжимания: 3x15`
  }
];

export function WorkoutPlannerPage({ 
  workouts, 
  currentUser, 
  onAddWorkout, 
  onUpdateWorkout, 
  onDeleteWorkout,
  onSendInvitation 
}: WorkoutPlannerPageProps) {
  const [friends] = useState<Friend[]>([
    { id: '1', name: 'Александр Петров', nickname: 'alex_gym', status: 'online' },
    { id: '2', name: 'Михаил Козлов', nickname: 'iron_mik', status: 'training' },
    { id: '3', name: 'Дмитрий Волков', nickname: 'wolf_dmitry', status: 'online' },
    { id: '4', name: 'Анна Смирнова', nickname: 'anna_strong', status: 'offline' },
  ]);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<WorkoutPlan | null>(null);
  const [expandedWorkouts, setExpandedWorkouts] = useState<Set<string>>(new Set());
  const [inviteDialogWorkout, setInviteDialogWorkout] = useState<WorkoutPlan | null>(null);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [inviteMessage, setInviteMessage] = useState('');
  
  const [newWorkout, setNewWorkout] = useState<Partial<WorkoutPlan>>({
    title: '',
    description: '',
    date: '',
    time: '',
    location: 'FitnessPark Сокольники',
    estimatedDuration: 60,
    friends: [],
    afterWorkout: 'Бегу домой'
  });

  const toggleExpanded = (workoutId: string) => {
    const newExpanded = new Set(expandedWorkouts);
    if (newExpanded.has(workoutId)) {
      newExpanded.delete(workoutId);
    } else {
      newExpanded.add(workoutId);
    }
    setExpandedWorkouts(newExpanded);
  };

  const useTemplate = (template: typeof workoutTemplates[0]) => {
    setNewWorkout({
      ...newWorkout,
      title: template.name,
      description: template.description
    });
  };

  const createWorkout = () => {
    if (!newWorkout.title || !newWorkout.date || !newWorkout.time) return;

    const workout = onAddWorkout({
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

    // Send invitations to selected friends
    if (newWorkout.friends && newWorkout.friends.length > 0) {
      newWorkout.friends.forEach(friendId => {
        const friend = friends.find(f => f.id === friendId);
        if (friend) {
          onSendInvitation(workout, friendId, friend.name, `Приглашаю на тренировку "${workout.title}"!`);
        }
      });
      toast.success(`Приглашения отправлены ${newWorkout.friends.length} друзьям`);
    }

    setNewWorkout({
      title: '',
      description: '',
      date: '',
      time: '',
      location: 'FitnessPark Сокольники',
      estimatedDuration: 60,
      friends: [],
      afterWorkout: 'Бегу домой'
    });
    setIsCreateDialogOpen(false);
  };

  const completeWorkout = (workoutId: string) => {
    onUpdateWorkout(workoutId, { status: 'completed' });
    toast.success('Тренировка отмечена как выполненная!');
  };

  const duplicateWorkout = (workout: WorkoutPlan) => {
    const duplicatedWorkout = onAddWorkout({
      ...workout,
      title: `${workout.title} (копия)`,
      date: new Date().toISOString().split('T')[0],
      status: 'planned'
    });
    toast.success('Тренировка скопирована');
  };

  const editWorkout = (workout: WorkoutPlan) => {
    setEditingWorkout(workout);
    setNewWorkout({
      title: workout.title,
      description: workout.description,
      date: workout.date,
      time: workout.time,
      location: workout.location,
      estimatedDuration: workout.estimatedDuration,
      friends: workout.friends,
      afterWorkout: workout.afterWorkout
    });
    setIsEditDialogOpen(true);
  };

  const saveEditedWorkout = () => {
    if (!editingWorkout || !newWorkout.title || !newWorkout.date || !newWorkout.time) return;

    onUpdateWorkout(editingWorkout.id, {
      title: newWorkout.title!,
      description: newWorkout.description || '',
      date: newWorkout.date!,
      time: newWorkout.time!,
      location: newWorkout.location || 'FitnessPark Сокольники',
      estimatedDuration: newWorkout.estimatedDuration || 60,
      friends: newWorkout.friends || [],
      afterWorkout: newWorkout.afterWorkout || 'Бегу домой'
    });

    toast.success('Тренировка обновлена');
    setIsEditDialogOpen(false);
    setEditingWorkout(null);
    setNewWorkout({
      title: '',
      description: '',
      date: '',
      time: '',
      location: 'FitnessPark Сокольники',
      estimatedDuration: 60,
      friends: [],
      afterWorkout: 'Бегу домой'
    });
  };

  const deleteWorkout = (workoutId: string) => {
    onDeleteWorkout(workoutId);
    toast.success('Тренировка удалена');
  };

  const openInviteDialog = (workout: WorkoutPlan) => {
    setInviteDialogWorkout(workout);
    setSelectedFriends([]);
    setInviteMessage(`Привет! Приглашаю тебя на тренировку "${workout.title}" ${new Date(workout.date).toLocaleDateString('ru-RU')} в ${workout.time}. Будет отлично потренироваться вместе!`);
  };

  const sendInvitations = () => {
    if (!inviteDialogWorkout || selectedFriends.length === 0) return;

    selectedFriends.forEach(friendId => {
      const friend = friends.find(f => f.id === friendId);
      if (friend) {
        onSendInvitation(inviteDialogWorkout, friendId, friend.name, inviteMessage);
      }
    });

    toast.success(`Приглашения отправлены ${selectedFriends.length} друзьям`);
    setInviteDialogWorkout(null);
    setSelectedFriends([]);
    setInviteMessage('');
  };

  const getStatusColor = (status: WorkoutPlan['status']) => {
    switch (status) {
      case 'planned': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-red-500';
    }
  };

  const getStatusLabel = (status: WorkoutPlan['status']) => {
    switch (status) {
      case 'planned': return 'Запланировано';
      case 'completed': return 'Выполнено';
      case 'cancelled': return 'Отменено';
    }
  };

  const getFriendName = (friendId: string) => {
    const friend = friends.find(f => f.id === friendId);
    return friend ? friend.name : 'Неизвестный друг';
  };

  // Simple markdown renderer for basic formatting
  const renderMarkdown = (markdown: string) => {
    return markdown
      .replace(/^# (.*$)/gim, '<h3 class="text-lg font-semibold mb-2 text-primary">$1</h3>')
      .replace(/^## (.*$)/gim, '<h4 class="text-base font-medium mb-2">$1</h4>')
      .replace(/^### (.*$)/gim, '<h5 class="text-sm font-medium mb-1">$1</h5>')
      .replace(/^\* (.*$)/gim, '<li class="ml-4 text-sm">• $1</li>')
      .replace(/^- (.*$)/gim, '<li class="ml-4 text-sm">• $1</li>')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br />');
  };

  const sortedWorkouts = workouts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const plannedWorkouts = workouts.filter(w => w.status === 'planned');
  const completedWorkouts = workouts.filter(w => w.status === 'completed');

  const friendsCount = newWorkout.friends?.length || 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl">Планировщик</h2>
          <p className="text-sm text-muted-foreground">
            Создавайте и управляйте тренировками
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Создать
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Новая тренировка</DialogTitle>
              <DialogDescription>
                Создайте новую тренировку с планом упражнений и пригласите друзей
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Основное</TabsTrigger>
                <TabsTrigger value="description">План тренировки</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 mt-4">
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
                  <Label htmlFor="location">Место проведения</Label>
                  <Input
                    id="location"
                    value={newWorkout.location || ''}
                    onChange={(e) => setNewWorkout({ ...newWorkout, location: e.target.value })}
                    placeholder="Название зала"
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
                  <Label htmlFor="duration">Примерная длительность (мин)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newWorkout.estimatedDuration || 60}
                    onChange={(e) => setNewWorkout({ ...newWorkout, estimatedDuration: Number(e.target.value) })}
                  />
                </div>

                {/* Friends Selection */}
                <div>
                  <Label>Пригласить друзей</Label>
                  <p className="text-xs text-muted-foreground mb-2">Выберите друзей для совместной тренировки</p>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {friends.slice(1).map(friend => {
                      const isSelected = newWorkout.friends?.includes(friend.id) || false;
                      const statusColors = {
                        online: 'bg-green-500',
                        training: 'bg-blue-500',
                        offline: 'bg-gray-400'
                      };
                      
                      return (
                        <div 
                          key={friend.id} 
                          className={`flex items-center space-x-3 p-2 rounded-lg border cursor-pointer transition-colors ${
                            isSelected ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                          }`}
                          onClick={() => {
                            const currentFriends = newWorkout.friends || [];
                            if (isSelected) {
                              setNewWorkout({ ...newWorkout, friends: currentFriends.filter(id => id !== friend.id) });
                            } else {
                              setNewWorkout({ ...newWorkout, friends: [...currentFriends, friend.id] });
                            }
                          }}
                        >
                          <div className="relative">
                            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium">
                                {friend.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${statusColors[friend.status]} rounded-full border-2 border-background`}></div>
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{friend.name}</p>
                            <p className="text-xs text-muted-foreground">@{friend.nickname}</p>
                          </div>
                          {isSelected && (
                            <CheckCircle className="h-4 w-4 text-primary" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {friendsCount > 0 && (
                    <p className="text-xs text-green-600 mt-2">
                      Выбрано друзей: {friendsCount}. Им будут отправлены приглашения после создания тренировки.
                    </p>
                  )}
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

              <TabsContent value="description" className="space-y-4 mt-4">
                {/* Templates */}
                <div>
                  <Label>Шаблоны тренировок</Label>
                  <p className="text-xs text-muted-foreground mb-2">Выберите готовый шаблон или создайте свой план</p>
                  <div className="grid grid-cols-1 gap-2 mb-4">
                    {workoutTemplates.map(template => (
                      <Button
                        key={template.id}
                        variant="outline"
                        size="sm"
                        onClick={() => useTemplate(template)}
                        className="justify-start h-auto p-3"
                      >
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4" />
                          <div className="text-left">
                            <p className="font-medium">{template.name}</p>
                            <p className="text-xs text-muted-foreground">Готовый план тренировки</p>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">План тренировки</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Опишите вашу тренировку. Используйте Markdown для красивого оформления.
                  </p>
                  <Textarea
                    id="description"
                    value={newWorkout.description || ''}
                    onChange={(e) => setNewWorkout({ ...newWorkout, description: e.target.value })}
                    placeholder={`# Моя тренировка

## Разминка (10 мин)
- Кардио: 5 мин
- Динамическая растяжка

## Основная часть (45 мин)
- **Упражнение 1**: 3 подхода по 10 повторений
- **Упражнение 2**: 4 подхода по 8 повторений

## Заминка (5 мин)
- Статическая растяжка

**Цель:** увеличение силы и выносливости`}
                    className="min-h-48 font-mono text-sm"
                  />
                  <div className="mt-2 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
                    <p className="mb-1">💡 Подсказки по оформлению:</p>
                    <p>• # Заголовок • **жирный текст** • *курсив* • - списки</p>
                  </div>
                </div>

                {/* Preview */}
                {newWorkout.description && (
                  <div>
                    <Label>Предварительный просмотр</Label>
                    <div className="border rounded-lg p-3 bg-card max-h-32 overflow-y-auto">
                      <div 
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ 
                          __html: renderMarkdown(newWorkout.description) 
                        }}
                      />
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Отмена
              </Button>
              <Button onClick={createWorkout} disabled={!newWorkout.title || !newWorkout.date || !newWorkout.time}>
                Создать тренировку
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xl font-semibold text-blue-600">{plannedWorkouts.length}</p>
            <p className="text-xs text-muted-foreground">Запланировано</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xl font-semibold text-green-600">{completedWorkouts.length}</p>
            <p className="text-xs text-muted-foreground">Выполнено</p>
          </CardContent>
        </Card>
      </div>

      {/* Workouts List */}
      <div className="space-y-3">
        {sortedWorkouts.map(workout => (
          <Card key={workout.id} className="overflow-hidden">
            <Collapsible>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
                    <CollapsibleTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(workout.id)}
                        className="p-1 h-auto mt-0.5 flex-shrink-0"
                      >
                        <ChevronDown 
                          className={`h-4 w-4 transition-transform ${
                            expandedWorkouts.has(workout.id) ? 'rotate-180' : ''
                          }`}
                        />
                      </Button>
                    </CollapsibleTrigger>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base leading-tight mb-1 break-words">{workout.title}</CardTitle>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3 flex-shrink-0" />
                          <span className="whitespace-nowrap">{new Date(workout.date).toLocaleDateString('ru-RU')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3 flex-shrink-0" />
                          <span className="whitespace-nowrap">{workout.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <Badge className={`${getStatusColor(workout.status)} text-xs whitespace-nowrap`}>
                      {getStatusLabel(workout.status)}
                    </Badge>
                    {workout.status === 'planned' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => editWorkout(workout)}
                        className="h-7 w-7 p-0 flex-shrink-0"
                        title="Редактировать"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => duplicateWorkout(workout)}
                      className="h-7 w-7 p-0 flex-shrink-0"
                      title="Копировать"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{workout.location}</span>
                      </div>
                      <span>~{workout.estimatedDuration} мин</span>
                      {workout.friends.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>{workout.friends.length} друг.</span>
                        </div>
                      )}
                    </div>

                    {/* Friends list */}
                    {workout.friends.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Участники:</p>
                        <div className="flex flex-wrap gap-2">
                          {workout.friends.map(friendId => {
                            const friend = friends.find(f => f.id === friendId);
                            if (!friend) return null;
                            
                            const statusColors = {
                              online: 'bg-green-500',
                              training: 'bg-blue-500',
                              offline: 'bg-gray-400'
                            };
                            
                            return (
                              <div key={friendId} className="flex items-center space-x-2 bg-muted/50 rounded px-2 py-1">
                                <div className="relative">
                                  <div className="w-5 h-5 bg-muted rounded-full flex items-center justify-center">
                                    <span className="text-xs">
                                      {friend.name.split(' ').map(n => n[0]).join('')}
                                    </span>
                                  </div>
                                  <div className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 ${statusColors[friend.status]} rounded-full border border-background`}></div>
                                </div>
                                <span className="text-xs">{friend.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {workout.description && (
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div 
                          className="prose prose-sm max-w-none text-sm"
                          dangerouslySetInnerHTML={{ 
                            __html: renderMarkdown(workout.description) 
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <p className="text-xs text-muted-foreground">
                        После: {workout.afterWorkout}
                      </p>
                      <div className="flex space-x-1">
                        {workout.status === 'planned' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openInviteDialog(workout)}
                              className="h-7 text-xs"
                            >
                              <Send className="h-3 w-3 mr-1" />
                              Пригласить
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => completeWorkout(workout.id)}
                              className="h-7 text-xs"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Выполнено
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteWorkout(workout.id)}
                          className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>

      {/* Invite Friends Dialog */}
      <Dialog open={!!inviteDialogWorkout} onOpenChange={() => setInviteDialogWorkout(null)}>
        <DialogContent className="max-w-full m-4 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Пригласить друзей</DialogTitle>
            <DialogDescription>
              {inviteDialogWorkout && `Пригласите друзей на тренировку "${inviteDialogWorkout.title}"`}
            </DialogDescription>
          </DialogHeader>
          
          {inviteDialogWorkout && (
            <div className="space-y-4">
              {/* Workout Info */}
              <Card>
                <CardContent className="p-4">
                  <h4 className="font-medium mb-2">{inviteDialogWorkout.title}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(inviteDialogWorkout.date).toLocaleDateString('ru-RU')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>{inviteDialogWorkout.time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{inviteDialogWorkout.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>~{inviteDialogWorkout.estimatedDuration} мин</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Friends Selection */}
              <div>
                <Label>Выберите друзей для приглашения</Label>
                <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
                  {friends.slice(1).map(friend => {
                    const isSelected = selectedFriends.includes(friend.id);
                    const statusColors = {
                      online: 'bg-green-500',
                      training: 'bg-blue-500',
                      offline: 'bg-gray-400'
                    };
                    
                    return (
                      <div 
                        key={friend.id} 
                        className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          isSelected ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                        }`}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedFriends(prev => prev.filter(id => id !== friend.id));
                          } else {
                            setSelectedFriends(prev => [...prev, friend.id]);
                          }
                        }}
                      >
                        <div className="relative">
                          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {friend.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${statusColors[friend.status]} rounded-full border-2 border-background`}></div>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{friend.name}</p>
                          <p className="text-sm text-muted-foreground">@{friend.nickname}</p>
                        </div>
                        {isSelected && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    );
                  })}
                </div>
                {selectedFriends.length > 0 && (
                  <p className="text-xs text-green-600 mt-2">
                    Выбрано: {selectedFriends.length} друзей
                  </p>
                )}
              </div>

              {/* Invite Message */}
              <div>
                <Label htmlFor="inviteMessage">Сообщение к приглашению</Label>
                <Textarea
                  id="inviteMessage"
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  placeholder="Добавьте персональное сообщение к приглашению..."
                  className="mt-1"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setInviteDialogWorkout(null)}>
                  Отмена
                </Button>
                <Button 
                  onClick={sendInvitations} 
                  disabled={selectedFriends.length === 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Отправить приглашения ({selectedFriends.length})
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Workout Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Редактировать тренировку</DialogTitle>
            <DialogDescription>
              Внесите изменения в тренировку
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Основное</TabsTrigger>
              <TabsTrigger value="description">План тренировки</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="edit-title">Название тренировки</Label>
                <Input
                  id="edit-title"
                  value={newWorkout.title || ''}
                  onChange={(e) => setNewWorkout({ ...newWorkout, title: e.target.value })}
                  placeholder="Например: День ног"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-location">Место проведения</Label>
                <Input
                  id="edit-location"
                  value={newWorkout.location || ''}
                  onChange={(e) => setNewWorkout({ ...newWorkout, location: e.target.value })}
                  placeholder="Название зала"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-date">Дата</Label>
                  <Input
                    id="edit-date"
                    type="date"
                    value={newWorkout.date || ''}
                    onChange={(e) => setNewWorkout({ ...newWorkout, date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-time">Время</Label>
                  <Input
                    id="edit-time"
                    type="time"
                    value={newWorkout.time || ''}
                    onChange={(e) => setNewWorkout({ ...newWorkout, time: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="edit-duration">Примерная длительность (мин)</Label>
                <Input
                  id="edit-duration"
                  type="number"
                  value={newWorkout.estimatedDuration || 60}
                  onChange={(e) => setNewWorkout({ ...newWorkout, estimatedDuration: Number(e.target.value) })}
                />
              </div>

              <div>
                <Label htmlFor="edit-afterWorkout">После тренировки</Label>
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

            <TabsContent value="description" className="space-y-4 mt-4">
              <div>
                <Label>План тренировки</Label>
                <Textarea
                  value={newWorkout.description || ''}
                  onChange={(e) => setNewWorkout({ ...newWorkout, description: e.target.value })}
                  placeholder="Опишите план тренировки в формате Markdown..."
                  rows={12}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Поддерживается Markdown разметка: **жирный**, *курсив*, # заголовки
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={saveEditedWorkout}>
              Сохранить изменения
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}