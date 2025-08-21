import {useEffect, useState} from 'react';
import { Card, CardContent } from '@/shared/ui/ui/card';
import { Badge } from '@/shared/ui/ui/badge';
import { Progress } from '@/shared/ui/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/ui/ui/dialog';
import { CheckCircle, Star, Zap, Flame, Trophy} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '@/features/tasks';
import {User, userStore} from "@/entities/user";
import {observer} from "mobx-react-lite";
import {taskStore} from "@/features/tasks/model/store.ts";
import {ScreenSpinner} from "@vkontakte/vkui";

interface TasksPageProps {
    currentUser: User;
}

export const TasksPage = observer(({ currentUser }: TasksPageProps) => {
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);




    useEffect(() => {
        taskStore.fetchTasks().catch((error) => console.log("Error fetching tasks",error));
    }, [currentUser.id]);


    const getDifficultyColor = (difficulty: Task['difficulty']) => {
        switch (difficulty) {
            case 'легкий':
                return 'bg-green-500';
            case 'средний':
                return 'bg-yellow-500';
            case 'тяжелый':
                return 'bg-orange-500';
        }
    };

    const getDifficultyIcon = (difficulty: Task['difficulty']) => {
        switch (difficulty) {
            case 'легкий':
                return <Star className="h-3 w-3"/>;
            case 'средний':
                return <Zap className="h-3 w-3"/>;
            case 'тяжелый':
                return <Flame className="h-3 w-3"/>;
        }
    };


    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
                                <Trophy className="h-4 w-4 text-green-600"/>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Баллы</p>
                                <p className="text-lg font-semibold">{currentUser.point}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                                <CheckCircle className="h-4 w-4 text-blue-600"/>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Выполнено</p>
                                <p className="text-lg font-semibold">{userStore.user? userStore.user.workoutsCompleted + userStore.user.workoutsPlaned + userStore.user.workoutsWithFriends : 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="p-4">
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <p className="text-sm">Прогресс до {currentUser.level + 1} уровня</p>
                            <p className="text-xs text-muted-foreground">{currentUser.point % 500}/500</p>
                        </div>
                        <Progress value={(currentUser.point % 500) / 5} className="h-2"/>
                    </div>
                </CardContent>
            </Card>
            <div>
                <h3 className="mb-3">Задания</h3>
                {taskStore.tasks? (
                    <div className="grid grid-cols-2 gap-3">
                        {taskStore.tasks.map(task => {
                            return (
                                <motion.div
                                    key={task.id}
                                    layout
                                    initial={{opacity: 0, scale: 0.9}}
                                    animate={{opacity: 1, scale: 1}}
                                    exit={{opacity: 0, scale: 0.9}}
                                    whileTap={{scale: 0.95}}
                                    onClick={() => setSelectedTask(task)}
                                    className="cursor-pointer"
                                >
                                    <Card className="hover:shadow-md transition-all duration-200 h-full">
                                        <CardContent className="p-3">
                                            <div className="space-y-3">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center space-x-2">
                                                        <Badge
                                                            variant="secondary"
                                                            className={`${getDifficultyColor(task.difficulty)} text-white text-xs`}
                                                        >
                                                            {getDifficultyIcon(task.difficulty)}
                                                        </Badge>
                                                    </div>
                                                    <Badge variant="outline" className="text-xs">+{task.points}</Badge>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-medium leading-tight mb-1">{task.title}</h4>
                                                    <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                ) : (
                    <ScreenSpinner/>
                )}

            </div>
            {taskStore.completedTasks.length > 0 && (
                <div>
                    <h4 className="mb-3 text-sm text-muted-foreground">Выполненные задания</h4>
                    <div className="space-y-2">
                        {taskStore.completedTasks.map(task => {
                            return (
                                <Card key={task.id} className="opacity-75">
                                    <CardContent className="p-3">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex items-center justify-center w-6 h-6 bg-green-100 rounded-full">
                                                <CheckCircle className="h-3 w-3 text-green-600"/>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{task.task.title}</p>
                                                    <p className="text-xs text-muted-foreground">{task.task.category}</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className="text-xs">+{task.task.points}</Badge>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            )}

            <AnimatePresence>
                {selectedTask && (
                    <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
                        <DialogContent className="max-w-[80vw] m-4 ml-1 max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <div className="flex items-center space-x-3">
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
                                            return line.trim() ? <p key={index} className="text-sm">{line}</p> : <br key={index}/>;
                                        })}
                                    </div>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </AnimatePresence>
        </div>
    );
});