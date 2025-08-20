import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui';
import { Badge, Skeleton } from '@/shared/ui';
import { observer } from 'mobx-react-lite';
import {WorkoutPlan} from "@/entities/workout/model/types.ts";
import {userStore} from "@/entities/user";
import {workoutStore} from "@/entities/workout";

export const HomePage = observer(() => {

  const isLoading = userStore.loadingStates.home || userStore.loadingStates.user || workoutStore.loadingStates.todayWorkouts;
  const hasError = userStore.error || workoutStore.error;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-24" />
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Ошибка загрузки</CardTitle>
            <CardDescription>
              {userStore.error || workoutStore.error || 'Не удалось загрузить данные. Попробуйте обновить страницу.'}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const userLevel = userStore.user?.level;
  const userPoints = userStore.user?.points;
  const userName = userStore.userName;
  const todayWorkouts = workoutStore.todayWorkouts;
  const todayWorkoutsCount = todayWorkouts.length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Добро пожаловать, {userName}!</CardTitle>
          <CardDescription>Ваш персональный фитнес-трекер</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold">Ваша статистика</h3>
              <div className="flex items-center space-x-2">
                <Badge variant="default">Уровень {userLevel}</Badge>
                <span className="text-sm text-muted-foreground">{userPoints} очков</span>
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Сегодня</h3>
              {workoutStore.loadingStates.todayWorkouts ? (
                <Skeleton className="h-4 w-40" />
              ) : todayWorkoutsCount > 0 ? (
                <p className="text-sm text-green-600">
                  Запланировано тренировок: {todayWorkoutsCount}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Запланированных тренировок нет
                </p>
              )}
            </div>
          </div>
          
          {todayWorkouts.length > 0 && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Тренировки на сегодня:</h4>
              <div className="space-y-2">
                {todayWorkouts.slice(0, 3).map((workout: WorkoutPlan) => (
                  <div key={workout.id} className="flex items-center justify-between p-2 bg-muted rounded-md">
                    <div>
                      <p className="font-medium text-sm">{workout.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {workout.time} • {workout.location}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {workout.status === 'planned' ? 'Запланирована' : 
                       workout.status === 'completed' ? 'Завершена' :
                       workout.status === 'cancelled' ? 'Отменена' : workout.status}
                    </Badge>
                  </div>
                ))}
                {todayWorkouts.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center">
                    и еще {todayWorkouts.length - 3} тренировок...
                  </p>
                )}
              </div>
            </div>
          )}
          
          {/* Дополнительная информация */}
          {workoutStore.upcomingWorkouts.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-medium mb-2">Ближайшие тренировки:</h4>
              <div className="space-y-1">
                {workoutStore.upcomingWorkouts.slice(0, 2).map((workout: WorkoutPlan) => (
                  <div key={workout.id} className="text-sm text-muted-foreground">
                    <span className="font-medium">{workout.title}</span> • {workout.date} в {workout.time}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
});
