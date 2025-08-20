import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/ui/card';
import { Badge } from '@/shared/ui/ui/badge';
import { Button } from '@/shared/ui/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/ui/ui/dialog';
import { Input } from '@/shared/ui/ui/input';
import { Label } from '@/shared/ui/ui/label';
import { Textarea } from '@/shared/ui/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/shared/ui/ui/collapsible';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/ui/tabs';
import { Calendar, MapPin, Clock, Users, Plus, ChevronDown, Trash2, CheckCircle, FileText, Edit } from 'lucide-react';
import { toast } from 'sonner';
import {User, userStore} from "@/entities/user";
import { workoutStore } from "@/entities/workout";
import { WorkoutPlan } from "@/entities/workout/model/types.ts";

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
- Дых����тельные упражнения`
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

const WorkoutPlannerPage = observer(({ currentUser }: { currentUser: User }) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<WorkoutPlan | null>(null);
  const [expandedWorkouts, setExpandedWorkouts] = useState<Set<string>>(new Set());
  // const [inviteDialogWorkout, setInviteDialogWorkout] = useState<WorkoutPlan | null>(null);
  // const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  // const [inviteMessage, setInviteMessage] = useState('');

  const [newWorkout, setNewWorkout] = useState<Partial<WorkoutPlan>>({
    title: '',
    description: '',
    date: '',
    time: '',
    location: 'FitnessPark Сокольники',
    estimatedDuration: 60,
    participants: [],
    afterWorkout: 'Бегу домой'
  });

  const workouts = workoutStore.workouts;

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

  const createWorkout = async () => {
    if (!newWorkout.title || !newWorkout.date || !newWorkout.time || !newWorkout.location) {
      toast.error('Заполните все обязательные поля');
      return;
    }
    try {
      await workoutStore.createWorkout({
        id: "",
        title: newWorkout.title!,
        description: newWorkout.description || '',
        date: newWorkout.date!,
        time: newWorkout.time!,
        location: newWorkout.location!,
        estimatedDuration: newWorkout.estimatedDuration || 60,
        participants: newWorkout.participants || [],
        afterWorkout: newWorkout.afterWorkout || "",
        status: "planned",
        createdAt: `${Date.now()}`,
        creator_id: currentUser.id
      });
      setNewWorkout({
        title: '',
        description: '',
        date: '',
        time: '',
        location: 'FitnessPark Сокольники',
        estimatedDuration: 60,
        participants: [],
        afterWorkout: 'Бегу домой'
      });
      setIsCreateDialogOpen(false);
      if(userStore.user){
        await userStore.updateUserStats("workoutsPlaned", 1);
        await userStore.updateUserStats("totalWorkouts", 1);
      }
      } catch (e) {
      toast.error('Ошибка создания тренировки');
    }
  };

  const completeWorkout = async (workout: WorkoutPlan) => {
    await workoutStore.updateWorkout(workout.id, {
      status: 'completed',
      id: workout.id,
      title: workout.title,
      description: workout.description,
      date:  workout.date,
      time: workout.time,
      location: workout.location,
      estimatedDuration: workout.estimatedDuration,
      participants: workout.participants,
      afterWorkout: workout.afterWorkout,
      createdAt: workout.createdAt,
      creator_id: workout.creator_id
    });
    if (userStore.user) {
      await userStore.updateUserStats("workoutsCompleted", 1)
    }
    toast.success('Тренировка отмечена как выполненная!');
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
      participants: workout.participants,
      afterWorkout: workout.afterWorkout
    });
    setIsEditDialogOpen(true);
  };

  const saveEditedWorkout = async () => {
    if (!editingWorkout || !newWorkout.title || !newWorkout.date || !newWorkout.time) return;
    await workoutStore.updateWorkout(editingWorkout.id, {
      title: newWorkout.title!,
      description: newWorkout.description || '',
      date: newWorkout.date!,
      time: newWorkout.time!,
      location: newWorkout.location || 'FitnessPark Сокольники',
      estimatedDuration: newWorkout.estimatedDuration || 60,
      participants: newWorkout.participants || [],
      afterWorkout: newWorkout.afterWorkout || 'Бегу домой',
      id: newWorkout.id || "",
      status: 'planned',
      createdAt: newWorkout.createdAt || "",
      creator_id: newWorkout.creator_id || "",
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
      participants: [],
      afterWorkout: 'Бегу домой'
    });
  };

  const deleteWorkout = async (workoutId: string) => {
    await workoutStore.deleteWorkout(workoutId);
    toast.success('Тренировка удалена');
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

  const sortedWorkouts = workouts
    .filter(w => w.creator_id === currentUser.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const signedUpWorkouts = workouts
    .filter(w => w.creator_id !== currentUser.id && w.participants.some(p => p.id === currentUser.id))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const participantsCount = newWorkout.participants?.length || 0;

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
            <p className="text-xl font-semibold text-blue-600">{userStore.user ? userStore.user.workoutsPlaned : 0}</p>
            <p className="text-xs text-muted-foreground">Запланировано</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xl font-semibold text-green-600">{userStore.user ? userStore.user.workoutsCompleted : 0}</p>
            <p className="text-xs text-muted-foreground">Выполнено</p>
          </CardContent>
        </Card>
      </div>

      {/* Workouts List */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold mb-2">Мои тренировки</h3>
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
                    <Badge>
                      {participantsCount}
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
                      {workout.participants.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>{workout.participants.length} друг.</span>
                        </div>
                      )}
                    </div>

                    {/* Friends list */}
                    {workout.participants.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-2">Участники:</p>
                        <div className="flex flex-wrap gap-2">
                          {workout.participants.map(friendId => {
                            const friend = workout.participants.find(f => f.id === friendId.id);
                            if (!friend) return null;
                            
                            const statusColors = {
                              online: 'bg-green-500',
                              training: 'bg-blue-500',
                              offline: 'bg-gray-400'
                            };
                            
                            return (
                              <div key={friendId.id} className="flex items-center space-x-2 bg-muted/50 rounded px-2 py-1">
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
                              onClick={() => completeWorkout(workout)}
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

      {/* Signed Up Workouts List */}
      {signedUpWorkouts.length > 0 && (
        <div className="space-y-3 mt-8">
          <h3 className="text-lg font-semibold mb-2 text-orange-600">Тренировки, на которые я записался</h3>
          {signedUpWorkouts.map(workout => (
            <Card key={workout.id} className="overflow-hidden">
              {/* You can reuse the same rendering as for your workouts, or simplify as needed */}
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start space-x-3 flex-1 min-w-0">
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
                    <Badge>
                      {workout.participants.length}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{workout.location}</span>
                    </div>
                    <span>~{workout.estimatedDuration} мин</span>
                    {workout.participants.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <Users className="h-3 w-3" />
                        <span>{workout.participants.length} друг.</span>
                      </div>
                    )}
                  </div>
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
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
});

export { WorkoutPlannerPage };
