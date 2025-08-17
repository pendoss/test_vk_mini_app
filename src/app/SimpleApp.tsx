import { useState, useEffect } from 'react';
import bridge, { UserInfo } from '@vkontakte/vk-bridge';
import { Button } from '@/shared/ui/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/ui/avatar';
import { Badge } from '@/shared/ui/ui/badge';
import { Trophy, Calendar, Users, Target, Coins, ClipboardList } from 'lucide-react';
import { HomePage } from '@/pages/home';
import { motion, AnimatePresence } from 'framer-motion';
import { Providers } from './providers';
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

export function SimpleApp() {
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initApp() {
      try {
        // Получить информацию о пользователе VK
        const userData = await bridge.send('VKWebAppGetUserInfo');
        setVKUser(userData);
        
        // Инициализировать приложение
        await bridge.send('VKWebAppInit');
        
        console.log('VK User:', userData);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing app:', error);
        setIsLoading(false);
      }
    }

    initApp();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Загрузка...</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'tasks':
        return (
          <div className="text-center py-12">
            <ClipboardList className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Задачи</h2>
            <p className="text-muted-foreground">Раздел находится в разработке</p>
          </div>
        );
      case 'calendar':
        return (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Календарь</h2>
            <p className="text-muted-foreground">Раздел находится в разработке</p>
          </div>
        );
      case 'friends':
        return (
          <div className="text-center py-12">
            <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Друзья</h2>
            <p className="text-muted-foreground">Раздел находится в разработке</p>
          </div>
        );
      case 'leaderboard':
        return (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Рейтинг</h2>
            <p className="text-muted-foreground">Раздел находится в разработке</p>
          </div>
        );
      default:
        return <HomePage />;
    }
  };

  return (
    <Providers>
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
    </Providers>
  );
}
