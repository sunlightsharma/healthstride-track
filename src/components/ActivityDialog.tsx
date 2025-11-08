import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ActivityItem } from "@/pages/Dashboard";

interface ActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (activity: ActivityItem | Omit<ActivityItem, "id">) => void;
  activity?: ActivityItem | null;
}

export const ActivityDialog = ({ open, onOpenChange, onSave, activity }: ActivityDialogProps) => {
  const [formData, setFormData] = useState<Omit<ActivityItem, "id">>({
    type: "workout",
    description: "",
    status: "planned",
    date: new Date().toISOString().split("T")[0],
    value: "",
  });

  useEffect(() => {
    if (activity) {
      setFormData({
        type: activity.type,
        description: activity.description,
        status: activity.status,
        date: new Date(activity.date).toISOString().split("T")[0],
        value: activity.value || "",
      });
    } else {
      setFormData({
        type: "workout",
        description: "",
        status: "planned",
        date: new Date().toISOString().split("T")[0],
        value: "",
      });
    }
  }, [activity, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activity) {
      onSave({ ...activity, ...formData });
    } else {
      onSave(formData);
    }
    onOpenChange(false);
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{activity ? "Edit Activity" : "Add New Activity"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="type">Activity Type</Label>
              <Select value={formData.type} onValueChange={(value) => handleChange("type", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="workout">Workout</SelectItem>
                  <SelectItem value="meal">Meal</SelectItem>
                  <SelectItem value="steps">Steps</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                placeholder="e.g., Morning Run"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="value">Value (optional)</Label>
              <Input
                id="value"
                placeholder="e.g., 5km, 400 cal, 10,000 steps"
                value={formData.value}
                onChange={(e) => handleChange("value", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="in progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">{activity ? "Update" : "Add"} Activity</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
