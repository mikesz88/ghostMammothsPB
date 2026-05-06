"use client";


import { Users } from "lucide-react";
import { useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { maxJoinGroupSizeForEventTeamSize } from "@/lib/queue/max-join-group-size";
import { is2Stay2OffRotation } from "@/lib/queue/rotation-policy";

import type { RotationType } from "@/lib/types";
import type React from "react";

interface JoinQueueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJoin: (
    players: Array<{ name: string; skillLevel: string }>,
    groupSize: number,
  ) => void | Promise<void>;
  /** While true, form is disabled and submit shows joining state. */
  isJoining?: boolean;
  eventTeamSize: number;
  rotationType: RotationType;
}

export function JoinQueueDialog({
  open,
  onOpenChange,
  onJoin,
  isJoining = false,
  eventTeamSize,
  rotationType,
}: JoinQueueDialogProps) {
  const soloOnlyMode = is2Stay2OffRotation(rotationType);
  const maxGroupForEvent = maxJoinGroupSizeForEventTeamSize(eventTeamSize);

  const [groupSize, setGroupSize] = useState("1");
  const [players, setPlayers] = useState([
    { name: "", skillLevel: "intermediate" },
  ]);

  const handleOpenChange = (next: boolean) => {
    if (!next && isJoining) return;
    onOpenChange(next);
  };

  const handleGroupSizeChange = (value: string) => {
    setGroupSize(value);
    const size = Number.parseInt(value);
    if (size > players.length) {
      setPlayers([
        ...players,
        ...Array(size - players.length).fill({
          name: "",
          skillLevel: "intermediate",
        }),
      ]);
    } else {
      setPlayers(players.slice(0, size));
    }
  };

  const getAvailableGroupSizes = () => {
    const max = soloOnlyMode ? 1 : maxGroupForEvent;
    return Array.from({ length: max }, (_, i) => i + 1);
  };

  const handlePlayerChange = (
    index: number,
    field: "name" | "skillLevel",
    value: string
  ) => {
    const newPlayers = [...players];
    newPlayers[index] = { ...newPlayers[index], [field]: value };
    setPlayers(newPlayers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isJoining) return;
    const allNamesValid = players.every((p) => p.name.trim());
    if (allNamesValid) {
      await Promise.resolve(onJoin(players, Number.parseInt(groupSize)));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Join Queue</DialogTitle>
          <DialogDescription>
            {soloOnlyMode
              ? "This event uses solo queue entries only. Enter your details below."
              : "Enter your details to join the queue for this event"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!soloOnlyMode ? (
            <div className="space-y-2">
              <Label htmlFor="group">Group Size</Label>
              <Select
                value={groupSize}
                onValueChange={handleGroupSizeChange}
                disabled={isJoining}
              >
                <SelectTrigger id="group" disabled={isJoining}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableGroupSizes().map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size === 1
                        ? "Solo (1 player)"
                        : size === 2
                          ? "Duo (2 players)"
                          : size === 3
                            ? "Triple (3 players)"
                            : "Quad (4 players)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}

          {soloOnlyMode ? (
            <Alert>
              <Users className="w-4 h-4" />
              <AlertDescription className="space-y-2">
                <span className="block">
                  2 Stay 2 Off: join as one player only (no duos or groups).
                </span>
                {eventTeamSize > 1 ? (
                  <span className="block text-muted-foreground">
                    You&apos;ll be paired with other players to form{" "}
                    {eventTeamSize === 2
                      ? "doubles"
                      : eventTeamSize === 3
                        ? "triplet"
                        : "quad"}{" "}
                    teams.
                  </span>
                ) : null}
              </AlertDescription>
            </Alert>
          ) : null}

          {!soloOnlyMode && Number.parseInt(groupSize) > 1 && (
            <Alert>
              <Users className="w-4 h-4" />
              <AlertDescription className="space-y-2">
                <span className="block">
                  You&apos;re joining as a pre-formed group of {groupSize}. The group
                  stays one unit in line and won&apos;t be split across different picks.
                </span>
                {eventTeamSize === 2 && Number.parseInt(groupSize) < 4 ? (
                  <span className="block text-muted-foreground">
                    Doubles needs four players on court. Your group will go up when the
                    host assigns a full court (for example, you may wait for one or more
                    other players from the queue).
                  </span>
                ) : null}
              </AlertDescription>
            </Alert>
          )}

          {!soloOnlyMode &&
            Number.parseInt(groupSize) === 1 &&
            eventTeamSize > 1 && (
            <Alert>
              <Users className="w-4 h-4" />
              <AlertDescription>
                You&apos;re joining solo. You&apos;ll be paired with other players to form{" "}
                {eventTeamSize === 2
                  ? "doubles"
                  : eventTeamSize === 3
                    ? "triplet"
                    : "quad"}{" "}
                teams.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            {players.map((player, index) => (
              <div
                key={index}
                className="p-4 border border-border rounded-lg space-y-3"
              >
                <h4 className="font-medium text-foreground">
                  Player {index + 1}
                  {index === 0 &&
                    Number.parseInt(groupSize) > 1 &&
                    " (Group Leader)"}
                </h4>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor={`name-${index}`}>Name</Label>
                    <Input
                      id={`name-${index}`}
                      value={player.name}
                      onChange={(e) =>
                        handlePlayerChange(index, "name", e.target.value)
                      }
                      placeholder="Enter name"
                      required
                      disabled={isJoining}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`skill-${index}`}>Skill Level</Label>
                    <Select
                      value={player.skillLevel}
                      onValueChange={(value) =>
                        handlePlayerChange(index, "skillLevel", value)
                      }
                      disabled={isJoining}
                    >
                      <SelectTrigger id={`skill-${index}`} disabled={isJoining}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">
                          Intermediate
                        </SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                        <SelectItem value="pro">Pro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isJoining}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isJoining}>
              {isJoining ? "Joining…" : "Join Queue"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
