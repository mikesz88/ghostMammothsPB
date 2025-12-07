"use client";

import type React from "react";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users } from "lucide-react";

interface JoinQueueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJoin: (
    players: Array<{ name: string; skillLevel: string }>,
    groupSize: number
  ) => void;
  eventTeamSize: number;
}

export function JoinQueueDialog({
  open,
  onOpenChange,
  onJoin,
  eventTeamSize,
}: JoinQueueDialogProps) {
  const [groupSize, setGroupSize] = useState("1");
  const [players, setPlayers] = useState([
    { name: "", skillLevel: "intermediate" },
  ]);

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

  // Get available group sizes based on event team size
  const getAvailableGroupSizes = () => {
    const sizes = [];
    for (let i = 1; i <= eventTeamSize; i++) {
      sizes.push(i);
    }
    return sizes;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allNamesValid = players.every((p) => p.name.trim());
    if (allNamesValid) {
      onJoin(players, Number.parseInt(groupSize));
      // Reset form
      setGroupSize("1");
      setPlayers([{ name: "", skillLevel: "intermediate" }]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Join Queue</DialogTitle>
          <DialogDescription>
            Enter your details to join the queue for this event
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="group">Group Size</Label>
            <Select value={groupSize} onValueChange={handleGroupSizeChange}>
              <SelectTrigger id="group">
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

          {Number.parseInt(groupSize) > 1 && (
            <Alert>
              <Users className="w-4 h-4" />
              <AlertDescription>
                You're joining as a pre-formed team of {groupSize}. Your team
                will stay together and not be split up.
              </AlertDescription>
            </Alert>
          )}

          {Number.parseInt(groupSize) === 1 && eventTeamSize > 1 && (
            <Alert>
              <Users className="w-4 h-4" />
              <AlertDescription>
                You're joining solo. You'll be paired with other players to form{" "}
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
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`skill-${index}`}>Skill Level</Label>
                    <Select
                      value={player.skillLevel}
                      onValueChange={(value) =>
                        handlePlayerChange(index, "skillLevel", value)
                      }
                    >
                      <SelectTrigger id={`skill-${index}`}>
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
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Join Queue
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
