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
  updateEventTeamSize,
  updateEventCourtCount,
} from "@/app/actions/test-helpers";
import { toast } from "sonner";
import { RefreshCw, Users, Trash2, Play } from "lucide-react";

interface TestControlsProps {
  eventId: string;
  currentRotationType: RotationType;
  currentTeamSize: number;
  currentCourtCount: number;
}

export function TestControls({
  eventId,
  currentRotationType,
  currentTeamSize,
  currentCourtCount,
}: TestControlsProps) {
  const [loading, setLoading] = useState(false);
  const [rotationType, setRotationType] =
    useState<RotationType>(currentRotationType);
  const [teamSize, setTeamSize] = useState<number>(currentTeamSize);
  const [courtCount, setCourtCount] = useState<number>(currentCourtCount);
  const [groupSize, setGroupSize] = useState<number>(1);

  const handleReset = async () => {
    setLoading(true);
    try {
      const result = await resetTestEvent(eventId);
      if (result.success) {
        toast.success("Test event reset!", {
          description: "Dummy users reloaded to queue",
        });
        // Reload page to show updated queue
        setTimeout(() => window.location.reload(), 500);
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
        // Reload page to reflect changes
        setTimeout(() => window.location.reload(), 500);
      } else {
        toast.error("Failed to update rotation type");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating rotation type");
    }
  };

  const handleTeamSizeChange = async (newSize: string) => {
    const size = Number(newSize);
    setTeamSize(size);

    // Reset group size if it exceeds new team size
    if (groupSize > size) {
      setGroupSize(size);
    }

    try {
      const result = await updateEventTeamSize(eventId, size);
      if (result.success) {
        const sizeText =
          size === 1
            ? "Solo (1v1)"
            : size === 2
            ? "Doubles (2v2)"
            : size === 3
            ? "Triplets (3v3)"
            : "Quads (4v4)";
        toast.success(`Team size changed to ${sizeText}`, {
          description: "Event updated for testing",
        });
        // Reload page to reflect changes in court display
        setTimeout(() => window.location.reload(), 500);
      } else {
        toast.error("Failed to update team size");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating team size");
    }
  };

  const handleCourtCountChange = async (newCount: string) => {
    const count = Number(newCount);
    setCourtCount(count);
    try {
      const result = await updateEventCourtCount(eventId, count);
      if (result.success) {
        toast.success(`Court count changed to ${count}`, {
          description: "Event updated for testing",
        });
        // Reload page to reflect changes in court display
        setTimeout(() => window.location.reload(), 500);
      } else {
        toast.error("Failed to update court count");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating court count");
    }
  };

  const handleAddDummyToQueue = async (size?: number) => {
    setLoading(true);
    const addGroupSize = size || groupSize;

    // Validate group size doesn't exceed team size
    if (addGroupSize > currentTeamSize) {
      toast.error(
        `Group size (${addGroupSize}) cannot exceed team size (${currentTeamSize})`,
        {
          description: `For ${
            currentTeamSize === 1
              ? "solo"
              : currentTeamSize === 2
              ? "doubles"
              : currentTeamSize === 3
              ? "triplets"
              : "quads"
          }, max group size is ${currentTeamSize}`,
        }
      );
      setLoading(false);
      return;
    }

    try {
      const result = await addDummyUsersToQueue(eventId, 1, addGroupSize);
      if (result.success) {
        const groupText =
          addGroupSize === 1 ? "solo player" : `group of ${addGroupSize}`;
        toast.success(`Added ${groupText} to queue`);
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

        {/* Court Count Selector */}
        <div className="space-y-2">
          <Label htmlFor="court-count">Number of Courts</Label>
          <Select
            value={courtCount.toString()}
            onValueChange={handleCourtCountChange}
          >
            <SelectTrigger id="court-count">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 Court</SelectItem>
              <SelectItem value="2">2 Courts</SelectItem>
              <SelectItem value="3">3 Courts</SelectItem>
              <SelectItem value="4">4 Courts</SelectItem>
              <SelectItem value="5">5 Courts</SelectItem>
              <SelectItem value="6">6 Courts</SelectItem>
              <SelectItem value="8">8 Courts</SelectItem>
              <SelectItem value="10">10 Courts</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Team Size Selector */}
        <div className="space-y-2">
          <Label htmlFor="team-size">Change Team Size (Court Type)</Label>
          <Select
            value={teamSize.toString()}
            onValueChange={handleTeamSizeChange}
          >
            <SelectTrigger id="team-size">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Solo (1v1)</SelectItem>
              <SelectItem value="2">Doubles (2v2)</SelectItem>
              <SelectItem value="3">Triplets (3v3)</SelectItem>
              <SelectItem value="4">Quads (4v4)</SelectItem>
            </SelectContent>
          </Select>
        </div>

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

        {/* Group Size Selector */}
        <div className="space-y-2">
          <Label htmlFor="group-size">Group Size for Testing</Label>
          <Select
            value={groupSize.toString()}
            onValueChange={(val) => setGroupSize(Number(val))}
          >
            <SelectTrigger id="group-size">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Solo (1 player)</SelectItem>
              {currentTeamSize >= 2 && (
                <SelectItem value="2">Duo (2 players)</SelectItem>
              )}
              {currentTeamSize >= 3 && (
                <SelectItem value="3">Triple (3 players)</SelectItem>
              )}
              {currentTeamSize >= 4 && (
                <SelectItem value="4">Quad (4 players)</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Quick Test Buttons - Add by Group Size */}
        <div className="space-y-2">
          <Label>Quick Add by Group Size</Label>
          <div className="grid grid-cols-4 gap-2">
            <Button
              onClick={() => handleAddDummyToQueue(1)}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              Solo
            </Button>
            <Button
              onClick={() => handleAddDummyToQueue(2)}
              disabled={loading || currentTeamSize < 2}
              variant="outline"
              size="sm"
            >
              Duo
            </Button>
            <Button
              onClick={() => handleAddDummyToQueue(3)}
              disabled={loading || currentTeamSize < 3}
              variant="outline"
              size="sm"
            >
              Triple
            </Button>
            <Button
              onClick={() => handleAddDummyToQueue(4)}
              disabled={loading || currentTeamSize < 4}
              variant="outline"
              size="sm"
            >
              Quad
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => handleAddDummyToQueue()}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <Users className="w-4 h-4 mr-2" />
            Add {groupSize === 1 ? "Solo" : `Group of ${groupSize}`}
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
