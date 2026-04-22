"use client";

import { useState } from "react";

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
import {
  is2Stay2OffRotation,
  is2Stay2OffValidTeamSize,
} from "@/lib/rotation-policy";

import type { Event, RotationType, TeamSize } from "@/lib/types";
import type React from "react";

interface CreateEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (event: Omit<Event, "id" | "createdAt" | "updatedAt">) => void;
}

export function CreateEventDialog({
  open,
  onOpenChange,
  onCreate,
}: CreateEventDialogProps) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [courtCount, setCourtCount] = useState("4");
  const [teamSize, setTeamSize] = useState<TeamSize>(2);
  const [rotationType, setRotationType] =
    useState<RotationType>("rotate-all");
  const [formError, setFormError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (name.trim() && location.trim() && date && time) {
      if (
        is2Stay2OffRotation(rotationType) &&
        !is2Stay2OffValidTeamSize(teamSize)
      ) {
        setFormError("2 Stay 2 Off requires doubles (team size 2).");
        return;
      }
      const eventDate = new Date(`${date}T${time}`);
      onCreate({
        name,
        location,
        date: eventDate,
        courtCount: Number.parseInt(courtCount),
        teamSize,
        rotationType,
        status: "active",
      });
      // Reset form
      setName("");
      setLocation("");
      setDate("");
      setTime("");
      setCourtCount("4");
      setTeamSize(2);
      setRotationType("rotate-all");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-foreground">
            Create New Event
          </DialogTitle>
          <DialogDescription>
            Set up a new pickleball event with queue management
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1 -mr-1"
        >
          {formError ? (
            <p className="text-sm text-destructive" role="alert">
              {formError}
            </p>
          ) : null}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Event Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Saturday Morning Doubles"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Central Park Courts"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="courts">Number of Courts</Label>
              <Select value={courtCount} onValueChange={setCourtCount}>
                <SelectTrigger id="courts">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} {num === 1 ? "Court" : "Courts"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="teamSize">Team Size</Label>
              <Select
                value={teamSize.toString()}
                onValueChange={(value) =>
                  setTeamSize(Number.parseInt(value) as TeamSize)
                }
              >
                <SelectTrigger id="teamSize">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">
                    Solo (1v1) - 2 players per court
                  </SelectItem>
                  <SelectItem value="2">
                    Doubles (2v2) - 4 players per court
                  </SelectItem>
                  <SelectItem value="3">
                    Triplets (3v3) - 6 players per court
                  </SelectItem>
                  <SelectItem value="4">
                    Quads (4v4) - 8 players per court
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rotation">Rotation Type</Label>
              <Select
                value={rotationType}
                onValueChange={(value) =>
                  setRotationType(value as RotationType)
                }
              >
                <SelectTrigger id="rotation">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rotate-all">Rotate All</SelectItem>
                  <SelectItem value="winners-stay">Winners Stay</SelectItem>
                  <SelectItem value="2-stay-2-off" disabled={teamSize !== 2}>
                    2 Stay, 2 Off (doubles, solo queue)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Rotation types:</strong>
              <br />
              <strong>Rotate all:</strong> After each game, everyone goes back
              through the queue (fair rotation for the whole group).
              <br />
              <strong>Winners stay:</strong> Winners stay on the court for the
              next game; losers rejoin the queue and get filled in when the host
              assigns the next group.
              <br />
              <strong>2 Stay, 2 Off:</strong> Doubles only. Solo queue entries
              form pairs on court. Two winners stay for the next game (split to
              opposite sides); two spots are filled from the queue.
            </p>
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
              Create Event
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
