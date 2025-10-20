"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RotationType } from "@/lib/types";
import {
  resetTestEvent,
  addDummyUsersToQueue,
  clearTestEvent,
  fillAllCourts,
  updateEventRotationType,
} from "@/app/actions/test-helpers";
import { toast } from "sonner";
import { RefreshCw, Users, Trash2, Play } from "lucide-react";

interface TestControlsProps {
  eventId: string;
  currentRotationType: RotationType;
}

export function TestControls({
  eventId,
  currentRotationType,
}: TestControlsProps) {
  const [loading, setLoading] = useState(false);
  const [rotationType, setRotationType] =
    useState<RotationType>(currentRotationType);

  const handleReset = async () => {
    setLoading(true);
    try {
      const result = await resetTestEvent(eventId);
      if (result.success) {
        toast.success("Test event reset!", {
          description: "Dummy users reloaded to queue",
        });
      } else {
        toast.error(result.error || "Failed to reset event");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error resetting event");
    } finally {
      setLoading(false);
    }
  };

  const handleRotationChange = async (newType: RotationType) => {
    setRotationType(newType);
    try {
      const result = await updateEventRotationType(eventId, newType);
      if (result.success) {
        toast.success(`Rotation type changed to ${newType}`, {
          description: "Takes effect on next game",
        });
      } else {
        toast.error("Failed to update rotation type");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating rotation type");
    }
  };

  const handleAddDummyToQueue = async () => {
    setLoading(true);
    try {
      const result = await addDummyUsersToQueue(eventId, 4);
      if (result.success) {
        toast.success(`Added ${result.added} users to queue`);
      } else {
        toast.error(result.error || "Failed to add users");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error adding users");
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    setLoading(true);
    try {
      const result = await clearTestEvent(eventId);
      if (result.success) {
        toast.success("Event cleared", {
          description: "All queue and court assignments removed",
        });
      } else {
        toast.error("Failed to clear event");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error clearing event");
    } finally {
      setLoading(false);
    }
  };

  const handleFillAllCourts = async () => {
    setLoading(true);
    try {
      const result = await fillAllCourts(eventId);
      if (result.success) {
        toast.success(`Filled ${result.courtsCreated} courts`);
      } else {
        toast.error(result.error || "Failed to fill courts");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error filling courts");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🧪 Test Mode Controls
        </CardTitle>
        <CardDescription>Quick actions for testing game flows</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Reset Button */}
        <Button
          onClick={handleReset}
          disabled={loading}
          variant="destructive"
          className="w-full"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset Event (Reload 8 Dummy Users)
        </Button>

        {/* Rotation Type Selector */}
        <div className="space-y-2">
          <Label htmlFor="rotation-type">Change Rotation Type</Label>
          <Select value={rotationType} onValueChange={handleRotationChange}>
            <SelectTrigger id="rotation-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="winners-stay">Winners Stay</SelectItem>
              <SelectItem value="rotate-all">Rotate All</SelectItem>
              <SelectItem value="2-stay-4-off">2 Stay 4 Off</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={handleAddDummyToQueue}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <Users className="w-4 h-4 mr-2" />
            Add 4 to Queue
          </Button>
          <Button
            onClick={handleClearAll}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
          <Button
            onClick={handleFillAllCourts}
            disabled={loading}
            variant="outline"
            size="sm"
            className="col-span-2"
          >
            <Play className="w-4 h-4 mr-2" />
            Fill All Courts
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
