import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/ui/card';
import { Badge } from '@/shared/ui/ui/badge';
import { Button } from '@/shared/ui/ui/button';
import { Progress } from '@/shared/ui/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/ui/dialog';
import { CheckCircle, Clock, Star, Zap, Flame, Crown, Trophy, Users, Calendar, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Task {
  id: string;
  title: string;
  description: string;
  detailedDescription: string;
  difficulty: 'легкий' | 'средний' | 'тяжелый' | 'невозможный';
  points: number;
  timeRemaining: string;
  progress: number; // 0-100
  maxProgress: number;
  completed: boolean;
  category: string;
  type: 'automatic' | 'manual'; // automatic tasks complete based on user activity
  triggerAction?: string; // what action triggers this task
  icon: any;
}

interface User {
  id: string;
  name: string;
  points: number;
  level: number;
}

interface TasksPageProps {
  currentUser: User;
  setCurrentUser: (user: User) => void;
}

interface UserActivity {
  workoutsCompleted: number;
  friendsAdded: number;
  workoutsPlanned: number;
  workoutsWithFriends: number;
  dailyPoints: number;
  totalWorkouts: number;
}

export function TasksPage({ currentUser, setCurrentUser }: TasksPageProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [userActivity, setUserActivity] = useState<UserActivity>({
    workoutsCompleted: 2,
    friendsAdded: 1,
    workoutsPlanned: 3,
    workoutsWithFriends: 1,
    dailyPoints: 45,
    totalWorkouts: 15
  });

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Ежедневная тренировка',
      description: 'Завершите запланированную тренировку',
      detailedDescription: `Посетите любую из ваших запланированных тренировок сегодня. 

Это базовое задание, которое помогает поддерживать регулярность тренировок.

**Как выполнить:**
- Перейдите в "Планировщик"
- Выберите тренировку на сегодня
- Отметьте её как выполненную

**Бонус:** +5 баллов за каждую дополнительную тренировку в день`,
      difficulty: 'легкий',
      points: 10,
      timeRemaining: '6 часов',
      progress: 0,
      maxProgress: 1,
      completed: false,
      category: 'Ежедневные',
      type: 'automatic',
      triggerAction: 'complete_workout',
      icon: Target
    },
    {
      id: '2',
      title: 'Социальная активность',
      description: 'Добавьте нового друга',
      detailedDescription: `Расширьте свою сеть контактов в фитнес-сообществе!

Найдите и добавьте нового друга, который разделяет ваши интересы в фитнесе.

**Как выполнить:**
- Перейдите во вкладку "Друзья"
- Нажмите "Найти друзей" 
- Найдите пользователя по имени
- Отправьте заявку в друзья

**Преимущества:** Возможность планировать совместные тренировки`,
      difficulty: 'средний',
      points: 20,
      timeRemaining: '2 дня',
      progress: 1,
      maxProgress: 1,
      completed: true,
      category: 'Социальные',
      type: 'automatic',
      triggerAction: 'add_friend',
      icon: Users
    },
    {
      id: '3',
      title: 'Попасть в топ-100',
      description: 'Войдите в дневной рейтинг',
      detailedDescription: `Станьте одним из 100 самых активных пользователей за день!

Текущий прогресс: ${userActivity.dailyPoints} из 50 баллов

**Способы набрать баллы:**
- Выполнить тренировку: +10 баллов
- Запланировать тренировку: +5 баллов  
- Пригласить друга на тренировку: +15 баллов
- Добавить нового друга: +20 баллов

**Совет:** Комбинируйте разные активности для быстрого набора баллов`,
      difficulty: 'средний',
      points: 20,
      timeRemaining: '12 часов',
      progress: userActivity.dailyPoints,
      maxProgress: 50,
      completed: userActivity.dailyPoints >= 50,
      category: 'Достижения',
      type: 'automatic',
      triggerAction: 'daily_points',
      icon: Trophy
    },
    {
      id: '4',
      title: 'Планирование недели',
      description: 'Запланируйте 3 тренировки',
      detailedDescription: `Планирование - ключ к успеху в фитнесе!

Создайте план тренировок на неделю вперёд.

**Текущий прогресс:** ${userActivity.workoutsPlanned} из 3

**Рекомендации:**
- Распределите тренировки равномерно по неделе
- Учитывайте время восстановления между тренировками
- Добавьте разнообразие: кардио, силовые, функциональные

**Бонус:** При планировании 5 тренировок получите дополнительно +10 баллов`,
      difficulty: 'средний',
      points: 15,
      timeRemaining: '3 дня',
      progress: userActivity.workoutsPlanned,
      maxProgress: 3,
      completed: userActivity.workoutsPlanned >= 3,
      category: 'Планирование',
      type: 'automatic',
      triggerAction: 'plan_workout',
      icon: Calendar
    },
    {
      id: '5',
      title: 'Тренировка с другом',
      description: 'Проведите совместную тренировку',
      detailedDescription: `Тренировки с друзьями мотивируют и делают процесс веселее!

**Текущий прогресс:** ${userActivity.workoutsWithFriends} из 1

**Как выполнить:**
1. Перейдите в "Планировщик"
2. Создайте новую тренировку
3. В разделе "Друзья" выберите участников
4. Проведите тренировку вместе

**Преимущества совместных тренировок:**
- Взаимная мотивация
- Возможность изучить новые упражнения
- Социальный аспект фитнеса`,
      difficulty: 'тяжелый',
      points: 30,
      timeRemaining: '5 дней',
      progress: userActivity.workoutsWithFriends,
      maxProgress: 1,
      completed: userActivity.workoutsWithFriends >= 1,
      category: 'Социальные',
      type: 'automatic',
      triggerAction: 'workout_with_friends',
      icon: Users
    },
    {
      id: '6',
      title: 'Легендарная серия',
      description: 'Выполните 10 тренировок подряд',
      detailedDescription: `Самое сложное испытание для настоящих чемпионов!

Проведите 10 тренировок без пропусков. Это задание требует невероятной дисциплины.

**Текущий прогресс:** ${userActivity.totalWorkouts} из 10

**Правила:**
- Тренировки должны быть в разные дни
- Минимум 1 день отдыха между тренировками
- Засчитываются только завершённые тренировки

**Награда:** 50 баллов + особый статус "Железная воля"`,
      difficulty: 'невозможный',
      points: 50,
      timeRemaining: '2 недели',
      progress: userActivity.totalWorkouts,
      maxProgress: 10,
      completed: userActivity.totalWorkouts >= 10,
      category: 'Элита',
      type: 'automatic',
      triggerAction: 'workout_streak',
      icon: Crown
    }
  ]);

  // Auto-update task progress based on user activity
  useEffect(() => {
    setTasks(prevTasks => prevTasks.map(task => {
      let newProgress = task.progress;
      
      switch (task.triggerAction) {
        case 'add_friend':
          newProgress = userActivity.friendsAdded;
          break;
        case 'daily_points':
          newProgress = userActivity.dailyPoints;
          break;
        case 'plan_workout':
          newProgress = userActivity.workoutsPlanned;
          break;
        case 'workout_with_friends':
          newProgress = userActivity.workoutsWithFriends;
          break;
        case 'workout_streak':
          newProgress = userActivity.totalWorkouts;
          break;
        case 'complete_workout':
          newProgress = userActivity.workoutsCompleted;
          break;
      }

      const completed = newProgress >= task.maxProgress;
      
      // Auto-award points when task is completed
      if (completed && !task.completed) {
        setCurrentUser({
          ...currentUser,
          points: currentUser.points + task.points
        });
      }

      return {
        ...task,
        progress: newProgress,
        completed
      };
    }));
  }, [userActivity, setCurrentUser]);

  const getDifficultyColor = (difficulty: Task['difficulty']) => {
    switch (difficulty) {
      case 'легкий': return 'bg-green-500';
      case 'средний': return 'bg-yellow-500';
      case 'тяжелый': return 'bg-orange-500';
      case 'невозможный': return 'bg-purple-500';
    }
  };

  const getDifficultyIcon = (difficulty: Task['difficulty']) => {
    switch (difficulty) {
      case 'легкий': return <Star className="h-3 w-3" />;
      case 'средний': return <Zap className="h-3 w-3" />;
      case 'тяжелый': return <Flame className="h-3 w-3" />;
      case 'невозможный': return <Crown className="h-3 w-3" />;
    }
  };

  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  // Simulate user activity (in real app this would come from actual user actions)
  const simulateActivity = (action: string) => {
    switch (action) {
      case 'complete_workout':
        setUserActivity(prev => ({ 
          ...prev, 
          workoutsCompleted: prev.workoutsCompleted + 1,
          dailyPoints: prev.dailyPoints + 10,
          totalWorkouts: prev.totalWorkouts + 1
        }));
        break;
      case 'add_friend':
        setUserActivity(prev => ({ 
          ...prev, 
          friendsAdded: prev.friendsAdded + 1,
          dailyPoints: prev.dailyPoints + 20
        }));
        break;
      case 'plan_workout':
        setUserActivity(prev => ({ 
          ...prev, 
          workoutsPlanned: prev.workoutsPlanned + 1,
          dailyPoints: prev.dailyPoints + 5
        }));
        break;
    }
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
                <Trophy className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Баллы</p>
                <p className="text-lg font-semibold">{currentUser.points}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                <CheckCircle className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Выполнено</p>
                <p className="text-lg font-semibold">{completedTasks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress to next level */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <p className="text-sm">Прогресс до {currentUser.level + 1} уровня</p>
              <p className="text-xs text-muted-foreground">{currentUser.points % 500}/500</p>
            </div>
            <Progress value={(currentUser.points % 500) / 5} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Debug buttons - remove in production */}
      <Card className="border-dashed">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-2">Тестирование (для разработки):</p>
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" onClick={() => simulateActivity('complete_workout')}>
              Завершить тренировку
            </Button>
            <Button size="sm" variant="outline" onClick={() => simulateActivity('plan_workout')}>
              Запланировать
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Tasks Grid */}
      <div>
        <h3 className="mb-3">Активные задания</h3>
        <div className="grid grid-cols-2 gap-3">
          {activeTasks.map(task => {
            const Icon = task.icon;
            const progressPercent = (task.progress / task.maxProgress) * 100;
            
            return (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedTask(task)}
                className="cursor-pointer"
              >
                <Card className="hover:shadow-md transition-all duration-200 h-full">
                  <CardContent className="p-3">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-lg">
                            <Icon className="h-4 w-4 text-primary" />
                          </div>
                          <Badge 
                            variant="secondary" 
                            className={`${getDifficultyColor(task.difficulty)} text-white text-xs`}
                          >
                            {getDifficultyIcon(task.difficulty)}
                          </Badge>
                        </div>
                        <Badge variant="outline" className="text-xs">+{task.points}</Badge>
                      </div>

                      {/* Title */}
                      <div>
                        <h4 className="text-sm font-medium leading-tight mb-1">{task.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                      </div>

                      {/* Progress */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>{task.progress}/{task.maxProgress}</span>
                          <span className="text-muted-foreground">{Math.round(progressPercent)}%</span>
                        </div>
                        <Progress value={progressPercent} className="h-1.5" />
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{task.timeRemaining}</span>
                        </div>
                        <span>{task.category}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm text-muted-foreground">Выполненные задания</h4>
          <div className="space-y-2">
            {completedTasks.map(task => {
              const Icon = task.icon;
              return (
                <Card key={task.id} className="opacity-75">
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-6 h-6 bg-green-100 rounded-full">
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{task.title}</p>
                          <p className="text-xs text-muted-foreground">{task.category}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">+{task.points}</Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      <AnimatePresence>
        {selectedTask && (
          <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
            <DialogContent className="max-w-full m-4 max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-lg">
                    <selectedTask.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <DialogTitle className="text-left">{selectedTask.title}</DialogTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge 
                        variant="secondary" 
                        className={`${getDifficultyColor(selectedTask.difficulty)} text-white text-xs`}
                      >
                        <span className="flex items-center space-x-1">
                          {getDifficultyIcon(selectedTask.difficulty)}
                          <span className="capitalize">{selectedTask.difficulty}</span>
                        </span>
                      </Badge>
                      <Badge variant="outline" className="text-xs">+{selectedTask.points} баллов</Badge>
                    </div>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Прогресс выполнения</span>
                    <span>{selectedTask.progress}/{selectedTask.maxProgress}</span>
                  </div>
                  <Progress value={(selectedTask.progress / selectedTask.maxProgress) * 100} />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <h4 className="font-medium">Описание задания</h4>
                  <div className="prose prose-sm max-w-none">
                    {selectedTask.detailedDescription.split('\n').map((line, index) => {
                      if (line.startsWith('**') && line.endsWith('**')) {
                        return <p key={index} className="font-semibold text-sm">{line.slice(2, -2)}</p>;
                      }
                      if (line.startsWith('- ')) {
                        return <li key={index} className="text-sm ml-4">{line.slice(2)}</li>;
                      }
                      return line.trim() ? <p key={index} className="text-sm">{line}</p> : <br key={index} />;
                    })}
                  </div>
                </div>

                {/* Meta info */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-xs text-muted-foreground">Категория</p>
                    <p className="text-sm font-medium">{selectedTask.category}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Времени осталось</p>
                    <p className="text-sm font-medium">{selectedTask.timeRemaining}</p>
                  </div>
                </div>

                {selectedTask.type === 'automatic' && (
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      💡 Это задание выполняется автоматически при вашей активности в приложении
                    </p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  );
}