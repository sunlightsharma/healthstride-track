import { Card, CardContent } from "@/components/ui/card";
import { Activity, Flame, Target } from "lucide-react";
import { ActivityItem } from "@/pages/Dashboard";

interface StatsCardsProps {
  activities: ActivityItem[];
}

export const StatsCards = ({ activities }: StatsCardsProps) => {
  const completedCount = activities.filter((a) => a.status === "completed").length;
  const inProgressCount = activities.filter((a) => a.status === "in progress").length;
  const totalCount = activities.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="border-border bg-gradient-to-br from-card to-card/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
              <Target className="w-6 h-6 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-3xl font-bold">{completedCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-gradient-to-br from-card to-card/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
              <Flame className="w-6 h-6 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-3xl font-bold">{inProgressCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-gradient-to-br from-card to-card/50">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Activity className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Activities</p>
              <p className="text-3xl font-bold">{totalCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
