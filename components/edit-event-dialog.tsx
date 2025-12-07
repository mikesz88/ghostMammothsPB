"use client";

import type React from "react";
import { useState, useEffect } from "react";
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
import type { Event, RotationType } from "@/lib/types";

interface EditEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: Event;
  onUpdate: (event: Omit<Event, "id" | "createdAt" | "updatedAt">) => void;
}

export function EditEventDialog({
  open,
  onOpenChange,
  event,
  onUpdate,
}: EditEventDialogProps) {
  const [name, setName] = useState(event.name);
  const [location, setLocation] = useState(event.location);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [courtCount, setCourtCount] = useState(event.courtCount.toString());
  const [rotationType, setRotationType] = useState<RotationType>(
    event.rotationType
  );

  useEffect(() => {
    setName(event.name);
    setLocation(event.location);
    setCourtCount(event.courtCount.toString());
    setRotationType(event.rotationType);

    const eventDate = new Date(event.date);
    setDate(eventDate.toISOString().split("T")[0]);
    setTime(eventDate.toTimeString().slice(0, 5));
  }, [event]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && location.trim() && date && time) {
      const eventDate = new Date(`${date}T${time}`);
      onUpdate({
        name,
        location,
        date: eventDate,
        courtCount: Number.parseInt(courtCount),
        teamSize: event.teamSize,
        rotationType,
        status: event.status,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Event</DialogTitle>
          <DialogDescription>
            Update event details and settings
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Event Name</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Saturday Morning Doubles"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-location">Location</Label>
              <Input
                id="edit-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Central Park Courts"
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-date">Date</Label>
              <Input
                id="edit-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-time">Time</Label>
              <Input
                id="edit-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-courts">Number of Courts</Label>
              <Select value={courtCount} onValueChange={setCourtCount}>
                <SelectTrigger id="edit-courts">
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
              <Label htmlFor="edit-rotation">Rotation Type</Label>
              <Select
                value={rotationType}
                onValueChange={(value) =>
                  setRotationType(value as RotationType)
                }
              >
                <SelectTrigger id="edit-rotation">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2-stay-4-off">2 Stay, 4 Off</SelectItem>
                  <SelectItem value="winners-stay">Winners Stay</SelectItem>
                  <SelectItem value="rotate-all">Rotate All</SelectItem>
                </SelectContent>
              </Select>
            </div>
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
              Update Event
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
