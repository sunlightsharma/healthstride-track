import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, Activity as ActivityIcon, Utensils, Footprints } from "lucide-react";
import { ActivityItem } from "@/pages/Dashboard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ActivityListProps {
  activities: ActivityItem[];
  onEdit: (activity: ActivityItem) => void;
  onDelete: (id: string) => void;
  onStatusChange: (activity: ActivityItem) => void;
}

const getActivityIcon = (type: ActivityItem["type"]) => {
  switch (type) {
    case "workout":
      return <ActivityIcon className="w-5 h-5" />;
    case "meal":
      return <Utensils className="w-5 h-5" />;
    case "steps":
      return <Footprints className="w-5 h-5" />;
  }
};

const getStatusColor = (status: ActivityItem["status"]) => {
  switch (status) {
    case "completed":
      return "bg-success/10 text-success border-success/20";
    case "in progress":
      return "bg-warning/10 text-warning border-warning/20";
    case "planned":
      return "bg-info/10 text-info border-info/20";
  }
};

export const ActivityList = ({ activities, onEdit, onDelete, onStatusChange }: ActivityListProps) => {
  if (activities.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">No activities yet. Add your first activity to get started!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <Card key={activity.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                {getActivityIcon(activity.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold truncate">{activity.description}</h4>
                  <Badge variant="outline" className="capitalize text-xs">
                    {activity.type}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  {activity.value && <span className="font-medium text-foreground">{activity.value}</span>}
                  <span>{new Date(activity.date).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Select
                  value={activity.status}
                  onValueChange={(value) =>
                    onStatusChange({ ...activity, status: value as ActivityItem["status"] })
                  }
                >
                  <SelectTrigger className="w-[140px] h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planned">Planned</SelectItem>
                    <SelectItem value="in progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="ghost" size="icon" onClick={() => onEdit(activity)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDelete(activity.id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
