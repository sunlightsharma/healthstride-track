import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Activity, LogOut, Plus } from "lucide-react";
import { ActivityList } from "@/components/ActivityList";
import { ActivityDialog } from "@/components/ActivityDialog";
import { StatsCards } from "@/components/StatsCards";
import { toast } from "sonner";

export interface ActivityItem {
  id: string;
  type: "workout" | "meal" | "steps";
  description: string;
  status: "planned" | "in progress" | "completed";
  date: string;
  value?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: "1",
      type: "workout",
      description: "Morning Run",
      status: "completed",
      date: new Date().toISOString(),
      value: "5km",
    },
    {
      id: "2",
      type: "meal",
      description: "Healthy Breakfast",
      status: "completed",
      date: new Date().toISOString(),
      value: "400 cal",
    },
    {
      id: "3",
      type: "steps",
      description: "Daily Steps",
      status: "in progress",
      date: new Date().toISOString(),
      value: "7,500",
    },
  ]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ActivityItem | null>(null);

  const handleLogout = () => {
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const handleAddActivity = (activity: Omit<ActivityItem, "id">) => {
    const newActivity: ActivityItem = {
      ...activity,
      id: Date.now().toString(),
    };
    setActivities([newActivity, ...activities]);
    toast.success("Activity added successfully");
  };

  const handleUpdateActivity = (activity: ActivityItem) => {
    setActivities(activities.map((a) => (a.id === activity.id ? activity : a)));
    toast.success("Activity updated successfully");
  };

  const handleDeleteActivity = (id: string) => {
    setActivities(activities.filter((a) => a.id !== id));
    toast.success("Activity deleted successfully");
  };

  const handleEditClick = (activity: ActivityItem) => {
    setEditingActivity(activity);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingActivity(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Activity className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">FitnessTrack</h1>
          </div>
          <Button variant="outline" onClick={handleLogout} size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Welcome back!</h2>
          <p className="text-muted-foreground">Track your daily activities and reach your fitness goals</p>
        </div>

        <StatsCards activities={activities} />

        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-semibold">Your Activities</h3>
          <Button onClick={() => setDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Activity
          </Button>
        </div>

        <ActivityList
          activities={activities}
          onEdit={handleEditClick}
          onDelete={handleDeleteActivity}
          onStatusChange={handleUpdateActivity}
        />
      </main>

      <ActivityDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        onSave={editingActivity ? handleUpdateActivity : handleAddActivity}
        activity={editingActivity}
      />
    </div>
  );
};

export default Dashboard;
