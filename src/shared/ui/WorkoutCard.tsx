import React from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/shared/ui/ui/collapsible";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/ui/card";
import { Button } from "@/shared/ui/ui/button";
import { Calendar, CheckCircle, ChevronDown, Clock, Edit, MapPin, Trash2, Users } from "lucide-react";
import { Badge } from "@/shared/ui/ui/badge";
import { WorkoutPlan } from "@/entities/workout/model/types";

interface WorkoutCardProps {
  workout: WorkoutPlan;
  expanded: boolean;
  onToggle: (id: string) => void;
  onEdit: (workout: WorkoutPlan) => void;
  onDelete: (id: string) => void;
  onComplete: (workout: WorkoutPlan) => void;
  getStatusColor: (status: WorkoutPlan["status"]) => string;
  getStatusLabel: (status: WorkoutPlan["status"]) => string;
  renderMarkdown: (markdown: string) => string;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({
  workout,
  expanded,
  onToggle,
  onEdit,
  onDelete,
  onComplete,
  getStatusColor,
  getStatusLabel,
  renderMarkdown
}) => {
  const participantsCount = workout.participants?.length || 0;
  return (
    <Card key={workout.id} className="overflow-hidden">
      <Collapsible open={expanded}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start space-x-3 flex-1 min-w-0">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggle(workout.id)}
                  className="p-1 h-auto mt-0.5 flex-shrink-0"
                >
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`}
                  />
                </Button>
              </CollapsibleTrigger>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base leading-tight mb-1 break-words">{workout.title}</CardTitle>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-3 w-3 flex-shrink-0" />
                    <span className="whitespace-nowrap">{new Date(workout.date).toLocaleDateString("ru-RU")}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3 flex-shrink-0" />
                    <span className="whitespace-nowrap">{workout.time.slice(0, 5)}</span>
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
              {workout.status === "planned" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(workout)}
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
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{new Date(workout.date).toLocaleDateString('ru-RU')}</span>
                <Clock className="h-4 w-4 ml-2" />
                <span>{workout.time ? workout.time.slice(0, 5) : ''}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{workout.location}</span>
                <Users className="h-4 w-4 ml-2" />
                <span>{participantsCount}</span>
              </div>
              {workout.participants.length > 0 && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Участники:</p>
                  <div className="flex flex-wrap gap-2">
                    {workout.participants.map(friendId => {
                      const friend = workout.participants.find(f => f.id === friendId.id);
                      if (!friend) return null;
                      const statusColors = {
                        online: "bg-green-500",
                        training: "bg-blue-500",
                        offline: "bg-gray-400"
                      };
                      return (
                        <div key={friendId.id} className="flex items-center space-x-2 bg-muted/50 rounded px-2 py-1">
                          <div className="relative">
                            <div className="w-5 h-5 bg-muted rounded-full flex items-center justify-center">
                              <span className="text-xs">
                                {friend.name.split(" ").map(n => n[0]).join("")}
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
                  {workout.status === "planned" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onComplete(workout)}
                      className="h-7 text-xs"
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Выполнено
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(workout.id)}
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
  );
};

export default WorkoutCard;
