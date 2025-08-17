import { useState, useEffect, ReactNode } from 'react';
import bridge, { UserInfo } from '@vkontakte/vk-bridge';
import { View, SplitLayout, SplitCol, ScreenSpinner } from '@vkontakte/vkui';
import { useActiveVkuiLocation } from '@vkontakte/vk-mini-apps-router';
import { Button } from '@/shared/ui/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/ui/avatar';
import { Badge } from '@/shared/ui/ui/badge';
import { Trophy, Calendar, Users, Target, Coins, ClipboardList, Bell } from 'lucide-react';
import { TasksPage } from '@/pages/tasks';
import { ProfilePage } from '@/pages/profile';
import { LeaderboardPage } from '@/pages/leaderboard';
import { CalendarPage } from '@/pages/calendar';
import { WorkoutPlannerPage } from '@/pages/workout-planner';
import { FriendsPage } from '@/pages/friends';
import { VKUIWrapper } from '@/shared/ui/VKUIWrapper';
import { motion, AnimatePresence } from 'framer-motion';

import { Persik, Home } from '../panels';
import { DEFAULT_VIEW_PANELS } from '../routes';
import '../styles/globals.css';

interface User {
  id: string;
  name: string;
  points: number;
  level: number;
  avatar?: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  birthDate?: string | null;
  sex?: 0 | 1 | 2;
}

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

interface WorkoutInvitation {
  id: string;
  workoutId: string;
  workout: WorkoutPlan;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'declined';
  sentAt: string;
  message?: string;
}

const tabs = [
  { id: 'tasks', label: 'Задания', icon: Target },
  { id: 'leaderboard', label: 'Рейтинг', icon: Trophy },
  { id: 'calendar', label: 'Календарь', icon: Calendar },
  { id: 'planner', label: 'Планировщик', icon: ClipboardList },
  { id: 'friends', label: 'Друзья', icon: Users },
];

export const App = () => {
  const { panel: activePanel = DEFAULT_VIEW_PANELS.HOME } = useActiveVkuiLocation();
  const [fetchedUser, setUser] = useState<UserInfo | undefined>();
  const [popout, setPopout] = useState<ReactNode | null>(<ScreenSpinner />);

  // FitQuest App State
  const [currentUser, setCurrentUser] = useState<User>({
    id: '1',
    name: 'Александр Петров',
    points: 1250,
    level: 12,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        // Получаем информацию о пользователе
        const user = await bridge.send('VKWebAppGetUserInfo');
        setUser(user);
        
        // Обновляем данные текущего пользователя из VK
        setCurrentUser(prev => ({
          ...prev,
          id: user.id.toString(),
          name: `${user.first_name} ${user.last_name}`,
          nickname: user.first_name.toLowerCase() + '_gym',
          avatar: user.photo_200
        }));

        // Настройка статус-бара для VK Mini App
        await bridge.send('VKWebAppSetViewSettings', {
          status_bar_style: 'dark',
          action_bar_color: '#ffffff'
        });

        // Отключаем свайпы для предотвращения перемещения интерфейса
        await bridge.send('VKWebAppDisableSwipeBack');
        
        setPopout(null);
      } catch (error) {
        console.error('Error fetching VK user data:', error);
        setPopout(null);
      }
    }

    fetchData();
  }, []);

  const [workouts, setWorkouts] = useState<WorkoutPlan[]>([
    {
      id: '1',
      title: 'День груди и трицепса',
      description: `# Интенсивная тренировка верха тела

## Разминка (10 мин)
- Кардио: 5 мин легкий бег
- Динамическая растяжка плеч

## Основная часть (60 мин)
- **Жим лежа**: 4x8 (100 кг)
- **Жим гантелей на наклонной**: 3x12 (35 кг)
- **Разводка гантелей**: 3x15 (20 кг)
- **Французский жим**: 3x15 (40 кг)
- **Отжимания на брусьях**: 3x12 до отказа

## Заминка (10 мин)
- Статическая растяжка
- Дыхательные упражнения

**Цель:** Увеличить силу и объем грудных мышц`,
      date: '2025-01-20',
      time: '18:00',
      location: 'FitnessPark Сокольники',
      estimatedDuration: 90,
      friends: ['2', '3'],
      afterWorkout: 'Постою поболтаю с ребятами из зала',
      status: 'planned',
      createdAt: '2025-01-18',
      createdBy: '1'
    },
    {
      id: '2',
      title: 'Кардио и пресс',
      description: `# Восстановительная тренировка

## Программа:
- Беговая дорожка: 30 мин в легком темпе
- Планка: 3x60 сек
- Скручивания: 3x25
- Велотренажер: 20 мин

*Цель: активное восстановление и работа с прессом*`,
      date: '2025-01-22',
      time: '07:00',
      location: 'FitnessPark Сокольники',
      estimatedDuration: 45,
      friends: [],
      afterWorkout: 'Бегу домой',
      status: 'planned',
      createdAt: '2025-01-17',
      createdBy: '1'
    },
    {
      id: '3',
      title: 'День спины',
      description: `# Мощная тренировка спины

## Упражнения:
1. **Становая тяга** - 4x6 (120 кг)
2. **Подтягивания** - 4x10 (+10 кг)
3. **Тяга штанги в наклоне** - 3x10 (80 кг)
4. **Подъем на бицепс** - 3x12 (20 кг)

### Особенности:
- Контролируемые движения
- Полная амплитуда
- Отдых между подходами: 2-3 мин`,
      date: '2025-01-15',
      time: '18:30',
      location: 'FitnessPark Сокольники',
      estimatedDuration: 100,
      friends: ['2'],
      afterWorkout: 'Иду на работу',
      status: 'completed',
      createdAt: '2025-01-13',
      createdBy: '1'
    }
  ]);

  const [workoutInvitations, setWorkoutInvitations] = useState<WorkoutInvitation[]>([
    {
      id: '1',
      workoutId: '4',
      workout: {
        id: '4',
        title: 'Тренировка ног',
        description: `# Интенсивная тренировка ног

## Основная часть:
- **Приседания**: 4x8 (120 кг)
- **Жим ногами**: 3x12 (200 кг)
- **Выпады**: 3x12 каждой ногой
- **Подъемы на носки**: 4x15

**Цель:** Развитие силы и массы ног`,
        date: '2025-01-21',
        time: '19:00',
        location: 'World Gym',
        estimatedDuration: 120,
        friends: ['1'],
        afterWorkout: 'Постою поболтаю с ребятами из зала',
        status: 'planned',
        createdAt: '2025-01-18',
        createdBy: '2'
      },
      fromUserId: '2',
      fromUserName: 'Михаил Козлов',
      toUserId: '1',
      status: 'pending',
      sentAt: '2025-01-18T10:30:00',
      message: 'Привет! Хочешь потренировать ноги вместе? Будет интенсивная тренировка в моем зале.'
    }
  ]);

  const [activeTab, setActiveTab] = useState('tasks');
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showFitQuest, setShowFitQuest] = useState(true);

  const activeTabData = tabs.find(tab => tab.id === activeTab);
  const pendingInvitations = workoutInvitations.filter(inv => inv.status === 'pending' && inv.toUserId === currentUser.id);

  const addWorkout = async (workout: Omit<WorkoutPlan, 'id' | 'createdAt' | 'createdBy'>): Promise<WorkoutPlan> => {
    const newWorkout: WorkoutPlan = {
      ...workout,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: currentUser.id
    };
    setWorkouts(prev => [newWorkout, ...prev]);
    return newWorkout;
  };

  const updateWorkout = async (workoutId: string, updates: Partial<WorkoutPlan>): Promise<void> => {
    setWorkouts(prev => prev.map(w => w.id === workoutId ? { ...w, ...updates } : w));
  };

  const deleteWorkout = async (workoutId: string): Promise<void> => {
    setWorkouts(prev => prev.filter(w => w.id !== workoutId));
  };

  const respondToInvitation = (invitationId: string, response: 'accepted' | 'declined') => {
    setWorkoutInvitations(prev => prev.map(inv => {
      if (inv.id === invitationId) {
        const updatedInvitation = { ...inv, status: response };
        
        // If accepted, add user to workout friends list
        if (response === 'accepted') {
          setWorkouts(prevWorkouts => prevWorkouts.map(w => {
            if (w.id === inv.workoutId) {
              return { ...w, friends: [...w.friends, currentUser.id] };
            }
            return w;
          }));
          
          // Add workout to user's workouts if not already there
          const existingWorkout = workouts.find(w => w.id === inv.workoutId);
          if (!existingWorkout) {
            setWorkouts(prev => [inv.workout, ...prev]);
          }
        }
        
        return updatedInvitation;
      }
      return inv;
    }));
  };

  const sendWorkoutInvitation = async (workout: WorkoutPlan, friendId: string, _friendName: string, message?: string): Promise<void> => {
    const invitation: WorkoutInvitation = {
      id: Date.now().toString(),
      workoutId: workout.id,
      workout,
      fromUserId: currentUser.id,
      fromUserName: currentUser.name,
      toUserId: friendId,
      status: 'pending',
      sentAt: new Date().toISOString(),
      message
    };
    setWorkoutInvitations(prev => [...prev, invitation]);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        // Получаем информацию о пользователе
        const user = await bridge.send('VKWebAppGetUserInfo');
        setUser(user);
        
        // Обновляем данные текущего пользователя из VK
        // Обновляем данные текущего пользователя из VK
        setCurrentUser(prev => ({
          ...prev,
          id: user.id.toString(),
          name: `${user.first_name} ${user.last_name}`,
          firstName: user.first_name,
          lastName: user.last_name,
          avatar: user.photo_200,
          city: user.city?.title || 'Москва',
          birthDate: user.bdate || null, // Используем реальную дату из VK или null
          sex: user.sex
        }));

        // Настройка статус-бара для VK Mini App
        await bridge.send('VKWebAppSetViewSettings', {
          status_bar_style: 'dark',
          action_bar_color: '#ffffff'
        });

        // Отключаем свайпы для предотвращения перемещения интерфейса
        await bridge.send('VKWebAppDisableSwipeBack');
        
        setPopout(null);
      } catch (error) {
        console.error('Error fetching VK user data:', error);
        setPopout(null);
      }
    }
    fetchData();
  }, []);

  // Show FitQuest app or original VK panels
  if (showFitQuest) {
    return (
      <VKUIWrapper>
        <div className="vkui-safe-area-wrapper prevent-overscroll min-h-screen bg-background">
          {/* Sticky Header */}
          <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
            <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-xl">
                  <Target className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold">FitQuest</h1>
                  <AnimatePresence mode="wait">
                    {activeTabData && (
                      <motion.p
                        key={activeTab}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="text-xs text-muted-foreground"
                      >
                        {activeTabData.label}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 bg-accent px-2 py-1 rounded-lg">
                  <Coins className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">{currentUser.points}</span>
                </div>

                {/* Notifications */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-auto relative"
                  onClick={() => setShowNotifications(true)}
                >
                  <div className="relative">
                    <Bell className="h-5 w-5" />
                    {pendingInvitations.length > 0 && (
                      <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500">
                        {pendingInvitations.length}
                      </Badge>
                    )}
                  </div>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-auto"
                  onClick={() => setShowProfile(true)}
                >
                  <Avatar className="h-8 w-8">
                    {currentUser.avatar && (
                      <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                    )}
                    <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                      {currentUser.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFitQuest(false)}
                >
                  Назад к VK
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="main-content">
          <div className="px-4 py-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
              {activeTab === 'tasks' && <TasksPage currentUser={currentUser} setCurrentUser={setCurrentUser} />}
              {activeTab === 'leaderboard' && <LeaderboardPage currentUser={currentUser} />}
              {activeTab === 'calendar' && (
                <CalendarPage 
                  workouts={workouts}
                  currentUser={currentUser}
                  onAddWorkout={addWorkout}
                  onUpdateWorkout={updateWorkout}
                  onDeleteWorkout={deleteWorkout}
                />
              )}
              {activeTab === 'planner' && (
                <WorkoutPlannerPage 
                  workouts={workouts}
                  currentUser={currentUser}
                  onAddWorkout={addWorkout}
                  onUpdateWorkout={updateWorkout}
                  onDeleteWorkout={deleteWorkout}
                  onSendInvitation={sendWorkoutInvitation}
                />
              )}
              {activeTab === 'friends' && <FriendsPage />}
            </motion.div>
          </AnimatePresence>
          </div>
        </div>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 bg-card border-t">
          <div className="grid grid-cols-5 h-16">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <Button
                  key={tab.id}
                  variant="ghost"
                  className={`flex flex-col items-center justify-center h-full rounded-none relative ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon className={`h-5 w-5 mb-1 ${isActive ? 'text-primary' : ''}`} />
                  <span className="text-xs font-medium">{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </Button>
              );
            })}
          </div>
        </nav>

        {/* Notifications Modal */}
        <AnimatePresence>
          {showNotifications && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50"
                onClick={() => setShowNotifications(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "100%" }}
                transition={{ type: "spring", duration: 0.4 }}
                className="fixed inset-x-0 bottom-0 bg-card rounded-t-xl z-50 max-h-[80vh] overflow-hidden"
              >
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="text-lg font-semibold">Уведомления</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNotifications(false)}
                    className="text-muted-foreground"
                  >
                    Закрыть
                  </Button>
                </div>
                <div className="overflow-y-auto max-h-[60vh] p-4">
                  {pendingInvitations.length > 0 ? (
                    <div className="space-y-4">
                      {pendingInvitations.map(invitation => (
                        <div key={invitation.id} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-start space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {invitation.fromUserName.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="font-medium">{invitation.fromUserName}</p>
                              <p className="text-sm text-muted-foreground">приглашает на тренировку</p>
                            </div>
                          </div>
                          
                          <div className="bg-muted/50 rounded-lg p-3">
                            <h4 className="font-medium">{invitation.workout.title}</h4>
                            <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                              <span>{new Date(invitation.workout.date).toLocaleDateString('ru-RU')} в {invitation.workout.time}</span>
                              <span>{invitation.workout.location}</span>
                              <span>~{invitation.workout.estimatedDuration} мин</span>
                            </div>
                            {invitation.message && (
                              <p className="text-sm mt-2 italic">"{invitation.message}"</p>
                            )}
                          </div>

                          <div className="flex space-x-2">
                            <Button
                              onClick={() => {
                                respondToInvitation(invitation.id, 'accepted');
                                setShowNotifications(false);
                                setActiveTab('calendar');
                              }}
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Принять
                            </Button>
                            <Button
                              onClick={() => respondToInvitation(invitation.id, 'declined')}
                              variant="outline"
                              size="sm"
                            >
                              Отклонить
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Нет новых уведомлений</p>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Profile Modal */}
        <AnimatePresence>
          {showProfile && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50"
                onClick={() => setShowProfile(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", duration: 0.3 }}
                className="fixed inset-x-4 top-20 bottom-20 bg-card rounded-xl z-50 overflow-hidden"
              >
                <div className="flex items-center justify-between p-4 border-b">
                  <h2 className="text-lg font-semibold">Профиль</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowProfile(false)}
                    className="text-muted-foreground"
                  >
                    Закрыть
                  </Button>
                </div>
                <div className="overflow-y-auto h-full pb-16">
                  <ProfilePage currentUser={currentUser} />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
        </div>
      </VKUIWrapper>
    );
  }

  return (
    <SplitLayout>
      <SplitCol>
        <View activePanel={activePanel}>
          <Home 
            id="home" 
            fetchedUser={fetchedUser} 
            onOpenFitQuest={() => setShowFitQuest(true)}
          />
          <Persik id="persik" />
        </View>
      </SplitCol>
      {popout}
    </SplitLayout>
  );
};
