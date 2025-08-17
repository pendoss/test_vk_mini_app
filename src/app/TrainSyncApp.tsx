import { useState, useEffect } from 'react';
import bridge, { UserInfo } from '@vkontakte/vk-bridge';
import { View, SplitLayout, SplitCol, ScreenSpinner } from '@vkontakte/vkui';
import { useActiveVkuiLocation } from '@vkontakte/vk-mini-apps-router';
import { Button } from '@/shared/ui/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/ui/avatar';
import { Badge } from '@/shared/ui/ui/badge';
import { Trophy, Calendar, Users, Target, Coins, ClipboardList } from 'lucide-react';
import { HomePage } from '@/pages/home';
import { TasksPage } from '@/pages/tasks';
import { ProfilePage } from '@/pages/profile';
import { LeaderboardPage } from '@/pages/leaderboard';
import { CalendarPage } from '@/pages/calendar';
import { WorkoutPlannerPage } from '@/pages/workout-planner';
import { FriendsPage } from '@/pages/friends';
import { VKUIWrapper } from '@/shared/ui/VKUIWrapper';
import { motion, AnimatePresence } from 'framer-motion';
import { Providers } from './providers';

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
}

export function App() {
  const { panel: activePanel } = useActiveVkuiLocation();
  const [user] = useState<User>({
    id: '1',
    name: 'Иван Иванов',
    points: 1250,
    level: 12,
    avatar: '',
    firstName: 'Иван',
    lastName: 'Иванов',
    city: 'Москва'
  });
  const [vkUser, setVKUser] = useState<UserInfo | null>(null);
  const [currentPage, setCurrentPage] = useState('home');
  const [popout, setPopout] = useState<JSX.Element | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initApp() {
      try {
        setPopout(<ScreenSpinner />);
        
        // Получить информацию о пользователе VK
        const userData = await bridge.send('VKWebAppGetUserInfo');
        setVKUser(userData);
        
        // Инициализировать приложение
        await bridge.send('VKWebAppInit');
        
        console.log('VK User:', userData);
        
        setPopout(null);
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing app:', error);
        setPopout(null);
        setIsLoading(false);
      }
    }

    initApp();
  }, []);

  if (isLoading) {
    return <ScreenSpinner />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'tasks':
        return <TasksPage currentUser={user} setCurrentUser={async () => {}} />;
      case 'leaderboard':
        return <LeaderboardPage currentUser={user} />;
      case 'calendar':
        return (
          <CalendarPage 
            workouts={[]} 
            currentUser={user} 
            onAddWorkout={async (workout) => ({ ...workout, id: '', createdAt: '', createdBy: user.id })} 
            onUpdateWorkout={async () => {}} 
            onDeleteWorkout={async () => {}} 
          />
        );
      case 'workout-planner':
        return (
          <WorkoutPlannerPage 
            workouts={[]} 
            currentUser={user} 
            onAddWorkout={async (workout) => ({ ...workout, id: '', createdAt: '', createdBy: user.id })} 
            onUpdateWorkout={async () => {}} 
            onDeleteWorkout={async () => {}} 
            onSaveTemplate={async () => {}} 
          />
        );
      case 'friends':
        return <FriendsPage />;
      case 'profile':
        return <ProfilePage currentUser={user} />;
      default:
        return <HomePage />;
    }
  };

  return (
    <Providers>
      <VKUIWrapper>
        <SplitLayout popout={popout}>
          <SplitCol>
            <View activePanel={activePanel || DEFAULT_VIEW_PANELS.HOME}>
              <div className="min-h-screen bg-background">
                {/* Header */}
                <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                  <div className="container flex h-14 items-center justify-between px-4">
                    <div className="flex items-center space-x-2">
                      <h1 className="text-lg font-semibold">TrainSync</h1>
                      <Badge variant="secondary" className="text-xs">
                        Beta
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 text-sm">
                        <Coins className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium">{user.points}</span>
                      </div>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={vkUser?.photo_200 || user.avatar} alt={user.name} />
                        <AvatarFallback>
                          {vkUser?.first_name?.[0] || user.firstName?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                </header>

                {/* Main Content */}
                <main className="container px-4 py-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentPage}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      {renderPage()}
                    </motion.div>
                  </AnimatePresence>
                </main>

                {/* Bottom Navigation */}
                <nav className="fixed bottom-0 left-0 right-0 bg-background border-t">
                  <div className="container px-4">
                    <div className="flex items-center justify-around py-3">
                      <Button
                        variant={currentPage === 'home' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setCurrentPage('home')}
                        className="flex-col h-auto py-2 px-3"
                      >
                        <Target className="h-4 w-4 mb-1" />
                        <span className="text-xs">Главная</span>
                      </Button>

                      <Button
                        variant={currentPage === 'tasks' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setCurrentPage('tasks')}
                        className="flex-col h-auto py-2 px-3"
                      >
                        <ClipboardList className="h-4 w-4 mb-1" />
                        <span className="text-xs">Задачи</span>
                      </Button>

                      <Button
                        variant={currentPage === 'calendar' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setCurrentPage('calendar')}
                        className="flex-col h-auto py-2 px-3"
                      >
                        <Calendar className="h-4 w-4 mb-1" />
                        <span className="text-xs">Календарь</span>
                      </Button>

                      <Button
                        variant={currentPage === 'friends' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setCurrentPage('friends')}
                        className="flex-col h-auto py-2 px-3"
                      >
                        <Users className="h-4 w-4 mb-1" />
                        <span className="text-xs">Друзья</span>
                      </Button>

                      <Button
                        variant={currentPage === 'leaderboard' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setCurrentPage('leaderboard')}
                        className="flex-col h-auto py-2 px-3"
                      >
                        <Trophy className="h-4 w-4 mb-1" />
                        <span className="text-xs">Рейтинг</span>
                      </Button>
                    </div>
                  </div>
                </nav>

                {/* Padding bottom for fixed navigation */}
                <div className="h-20"></div>
              </div>
            </View>
          </SplitCol>
        </SplitLayout>
      </VKUIWrapper>
    </Providers>
  );
}
