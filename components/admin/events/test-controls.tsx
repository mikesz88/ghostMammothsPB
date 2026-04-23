"use client";

import { RefreshCw, Users, Trash2, Play } from "lucide-react";

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
import { useTestControls } from "@/lib/hooks/use-test-controls";

import type { RotationType } from "@/lib/types";

interface TestControlsProps {
  eventId: string;
  currentRotationType: RotationType;
  currentTeamSize: number;
  currentCourtCount: number;
  /** Called after queue-changing actions so admin UI refreshes without full reload. */
  onQueueUpdated?: () => void | Promise<void>;
}

export function TestControls({
  eventId,
  currentRotationType,
  currentTeamSize,
  currentCourtCount,
  onQueueUpdated,
}: TestControlsProps) {
  const {
    loading,
    rotationType,
    teamSize,
    courtCount,
    groupSize,
    setGroupSize,
    handleReset,
    handleRotationChange,
    handleTeamSizeChange,
    handleCourtCountChange,
    handleAddDummyToQueue,
    handleClearAll,
    handleFillAllCourts,
    currentTeamSize: teamSizeCap,
  } = useTestControls({
    eventId,
    currentRotationType,
    currentTeamSize,
    currentCourtCount,
    onQueueUpdated,
  });

  return (
    <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🧪 Test Mode Controls
        </CardTitle>
        <CardDescription>Quick actions for testing game flows</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={handleReset}
          disabled={loading}
          variant="destructive"
          className="w-full"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Reset Event (Reload 8 Dummy Users)
        </Button>

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

        <div className="space-y-2">
          <Label htmlFor="rotation-type">Change Rotation Type</Label>
          <Select value={rotationType} onValueChange={handleRotationChange}>
            <SelectTrigger id="rotation-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rotate-all">Rotate All</SelectItem>
              <SelectItem value="winners-stay">Winners Stay</SelectItem>
              <SelectItem value="2-stay-2-off" disabled={teamSizeCap !== 2}>
                2 Stay 2 Off
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

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
              {teamSizeCap >= 2 ? (
                <SelectItem value="2">Duo (2 players)</SelectItem>
              ) : null}
              {teamSizeCap >= 3 ? (
                <SelectItem value="3">Triple (3 players)</SelectItem>
              ) : null}
              {teamSizeCap >= 4 ? (
                <SelectItem value="4">Quad (4 players)</SelectItem>
              ) : null}
            </SelectContent>
          </Select>
        </div>

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
              disabled={loading || teamSizeCap < 2}
              variant="outline"
              size="sm"
            >
              Duo
            </Button>
            <Button
              onClick={() => handleAddDummyToQueue(3)}
              disabled={loading || teamSizeCap < 3}
              variant="outline"
              size="sm"
            >
              Triple
            </Button>
            <Button
              onClick={() => handleAddDummyToQueue(4)}
              disabled={loading || teamSizeCap < 4}
              variant="outline"
              size="sm"
            >
              Quad
            </Button>
          </div>
        </div>

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
