import { useState, useEffect, ReactNode } from 'react';
import { ScreenSpinner } from '@vkontakte/vkui';
import { Button } from '@/shared/ui/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/ui/avatar';
import { Trophy, Calendar, Users, Target, Coins, ClipboardList} from 'lucide-react';
import { ProfilePage } from '@/pages/profile';
import { LeaderboardPage } from '@/pages/leaderboard';
import { CalendarPage } from '@/pages/calendar';
import { WorkoutPlannerPage } from '@/pages/workout-planner';
import { FriendsPage } from '@/pages/friends';
import { VKUIWrapper } from '@/shared/ui/VKUIWrapper';
import { motion, AnimatePresence } from 'framer-motion';

import '../styles/globals.css';


import {userStore} from '@/entities/user';

import bridge from "@vkontakte/vk-bridge";
import {TasksPage} from "@/pages/tasks/ui/TasksPage.tsx";
import { OnboardingModal } from "@/pages/onboarding/ui/Onboarding";


const tabs = [
  { id: 'tasks', label: 'Задания', icon: Target },
  { id: 'leaderboard', label: 'Рейтинг', icon: Trophy },
  { id: 'calendar', label: 'Календарь', icon: Calendar },
  { id: 'planner', label: 'Планы', icon: ClipboardList },
  { id: 'friends', label: 'Друзья', icon: Users },
];

export const App = () => {
  const [popout, setPopout] = useState<ReactNode | null>(<ScreenSpinner />);


  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
          const initializeApp = async () => {
              try {
                  await userStore.initializeUser();
                  await userStore.updateUserScore();
                  if (userStore.user && userStore.user.weight === 0) {
                    setShowOnboarding(true);
                  }
              } catch (error) {
                  console.error('Failed to initialize user:', error);
              } finally {
                  setPopout(null);
              }
          };

          initializeApp()
          bridge.send('VKWebAppSetViewSettings', {
              status_bar_style: "dark",
              action_bar_color: '#ffffff'
          }).catch((error) => console.log(error));
          bridge.send('VKWebAppDisableSwipeBack').catch((error) => console.log(error));
      }, []);
  const [activeTab, setActiveTab] = useState('tasks');
  const [showProfile, setShowProfile] = useState(false);
  const activeTabData = tabs.find(tab => tab.id === activeTab);

    return (
        <>
          <OnboardingModal
            isOpen={showOnboarding}
            onClose={() => setShowOnboarding(false)}
          />
          {userStore.user? (
              <VKUIWrapper>
                <div className="vkui-safe-area-wrapper prevent-overscroll min-h-screen bg-background">
                  <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
                    <div className="px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-xl">
                            <Target className="h-6 w-6 text-primary-foreground" />
                          </div>
                          <div>
                            <h1 className="text-lg font-semibold">TrainSync</h1>
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
                            <span className="text-sm font-medium">{userStore.user.point}</span>
                          </div>
                          <Button
                              variant="ghost"
                              size="sm"
                              className="p-0 h-auto"
                              onClick={() => setShowProfile(true)}
                          >
                            <Avatar className="h-8 w-8">
                              {userStore.user.avatar && (
                                  <AvatarImage src={userStore.user.avatar} alt={userStore.user.name} />
                              )}
                              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                {userStore.user.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </header>
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
                          {activeTab === 'tasks' && <TasksPage currentUser={userStore.user} />}
                          {activeTab === 'leaderboard' && <LeaderboardPage currentUser={userStore.user} />}
                          {activeTab === 'calendar' && (
                              <CalendarPage
                                  currentUser={userStore.user}
                              />
                          )}
                          {activeTab === 'planner' && (
                              <WorkoutPlannerPage
                                  currentUser={userStore.user}
                              />
                          )}
                          {activeTab === 'friends' && <FriendsPage />}
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>
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

                                {isActive && (<span className="text-xs font-medium">{tab.label}</span>) }
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
                              <ProfilePage />
                            </div>
                          </motion.div>
                        </>
                    )}
                  </AnimatePresence>
                </div>
              </VKUIWrapper>
          ):(
              <>
                {popout}
              </>
          )}
        </>


    );
};
