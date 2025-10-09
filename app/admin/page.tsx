"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Plus,
  Calendar,
  MapPin,
  Settings,
  Trash2,
  Edit,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateEventDialog } from "@/components/create-event-dialog";
import { EditEventDialog } from "@/components/edit-event-dialog";
import type { Event } from "@/lib/types";
import Image from "next/image";

// Mock data
const mockEvents: Event[] = [
  {
    id: "1",
    name: "Saturday Morning Doubles",
    location: "Central Park Courts",
    date: new Date("2025-10-04T09:00:00"),
    courtCount: 4,
    rotationType: "2-stay-4-off",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    name: "Evening Mixed Play",
    location: "Riverside Recreation Center",
    date: new Date("2025-10-04T18:00:00"),
    courtCount: 3,
    rotationType: "winners-stay",
    status: "active",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function AdminPage() {
  const [events, setEvents] = useState<Event[]>(mockEvents);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  const handleCreateEvent = (
    eventData: Omit<Event, "id" | "createdAt" | "updatedAt">
  ) => {
    const newEvent: Event = {
      ...eventData,
      id: Math.random().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setEvents([...events, newEvent]);
    setShowCreateDialog(false);
  };

  const handleUpdateEvent = (
    eventData: Omit<Event, "id" | "createdAt" | "updatedAt">
  ) => {
    if (!editingEvent) return;
    const updatedEvents = events.map((e) =>
      e.id === editingEvent.id
        ? {
            ...e,
            ...eventData,
            updatedAt: new Date(),
          }
        : e
    );
    setEvents(updatedEvents);
    setEditingEvent(null);
  };

  const handleEndEvent = (eventId: string) => {
    const updatedEvents = events.map((e) =>
      e.id === eventId ? { ...e, status: "ended" as const } : e
    );
    setEvents(updatedEvents);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this event? This will remove all queue entries and court assignments."
      )
    ) {
      setEvents(events.filter((e) => e.id !== eventId));
    }
  };

  const activeEvents = events.filter((e) => e.status === "active");
  const endedEvents = events.filter((e) => e.status === "ended");

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/icon-32x32.png"
              alt="Ghost Mammoths PB"
              width={38}
              height={38}
            />
            {/* <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-primary-foreground" />
            </div> */}
            <span className="text-xl font-bold text-foreground">
              Ghost Mammoths PB
            </span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/events"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Events
            </Link>
            <Link href="/admin" className="text-foreground font-medium">
              Admin
            </Link>
          </nav>
        </div>
      </header>

      {/* Page Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Event Management
            </h1>
            <p className="text-muted-foreground">
              Create and manage pickleball events
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Active Events
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {activeEvents.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Total Courts
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {activeEvents.reduce((sum, e) => sum + e.courtCount, 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Ended Events
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {endedEvents.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-muted/50 rounded-lg flex items-center justify-center">
                  <Settings className="w-6 h-6 text-muted-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Events */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Active Events
          </h2>
          {activeEvents.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground mb-4">No active events</p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  Create Your First Event
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {activeEvents.map((event) => (
                <Card key={event.id} className="border-border bg-card">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="default">Active</Badge>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingEvent(event)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-foreground">
                      {event.name}
                    </CardTitle>
                    <CardDescription className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4" />
                        {event.location}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4" />
                        {event.date.toLocaleDateString()} at{" "}
                        {event.date.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Settings className="w-4 h-4" />
                        {event.courtCount} courts • {event.rotationType}
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2">
                      <Button variant="default" className="flex-1" asChild>
                        <Link href={`/admin/events/${event.id}`}>
                          Manage Event
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 bg-transparent"
                        asChild
                      >
                        <Link href={`/events/${event.id}`}>View Public</Link>
                      </Button>
                    </div>
                    <Button
                      variant="destructive"
                      className="w-full mt-2"
                      size="sm"
                      onClick={() => handleEndEvent(event.id)}
                    >
                      End Event
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Ended Events */}
        {endedEvents.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Ended Events
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {endedEvents.map((event) => (
                <Card
                  key={event.id}
                  className="border-border bg-card opacity-60"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="secondary">Ended</Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteEvent(event.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <CardTitle className="text-foreground">
                      {event.name}
                    </CardTitle>
                    <CardDescription className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4" />
                        {event.location}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4" />
                        {event.date.toLocaleDateString()}
                      </div>
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <CreateEventDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreate={handleCreateEvent}
      />
      {editingEvent && (
        <EditEventDialog
          open={!!editingEvent}
          onOpenChange={(open) => !open && setEditingEvent(null)}
          event={editingEvent}
          onUpdate={handleUpdateEvent}
        />
      )}
    </div>
  );
}
