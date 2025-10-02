"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Event, RotationType } from "@/lib/types"

interface CreateEventDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (event: Omit<Event, "id" | "createdAt" | "updatedAt">) => void
}

export function CreateEventDialog({ open, onOpenChange, onCreate }: CreateEventDialogProps) {
  const [name, setName] = useState("")
  const [location, setLocation] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [courtCount, setCourtCount] = useState("4")
  const [rotationType, setRotationType] = useState<RotationType>("2-stay-4-off")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim() && location.trim() && date && time) {
      const eventDate = new Date(`${date}T${time}`)
      onCreate({
        name,
        location,
        date: eventDate,
        courtCount: Number.parseInt(courtCount),
        rotationType,
        status: "active",
      })
      // Reset form
      setName("")
      setLocation("")
      setDate("")
      setTime("")
      setCourtCount("4")
      setRotationType("2-stay-4-off")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-foreground">Create New Event</DialogTitle>
          <DialogDescription>Set up a new pickleball event with queue management</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Time</Label>
              <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
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
              <Label htmlFor="rotation">Rotation Type</Label>
              <Select value={rotationType} onValueChange={(value) => setRotationType(value as RotationType)}>
                <SelectTrigger id="rotation">
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

          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Rotation Types:</strong>
              <br />
              <strong>2 Stay, 4 Off:</strong> Winning team stays, losing team goes to back of queue
              <br />
              <strong>Winners Stay:</strong> All winners stay on court, losers rotate
              <br />
              <strong>Rotate All:</strong> All players rotate after each game
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Create Event
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
