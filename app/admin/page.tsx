"use client";

import { useState, useEffect } from "react";
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
  Loader2,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
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
import { Header } from "@/components/ui/header";
import { createClient } from "@/lib/supabase/client";
import type { Event, TeamSize, RotationType, EventStatus } from "@/lib/types";
import type { Database } from "@/supabase/supa-schema";

type EventRow = Database["public"]["Tables"]["events"]["Row"];

export default function AdminPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch events from Supabase
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("date", { ascending: true });

    if (error) {
      console.error("Error fetching events:", error);
    } else {
      // Convert date strings to Date objects and parse court_count
      const eventsWithDates = (data || []).map((event: EventRow) => ({
        id: event.id,
        name: event.name,
        location: event.location,
        date:
          event.date && event.time
            ? new Date(`${event.date}T${event.time}`)
            : new Date(event.date),
        courtCount:
          parseInt(event.court_count.toString()) || parseInt(event.num_courts) || 0,
        teamSize: event.team_size as TeamSize || 2,
        rotationType: event.rotation_type as RotationType,
        status: event.status as EventStatus,
        createdAt: new Date(event.created_at),
        updatedAt: event.updated_at ? new Date(event.updated_at) : undefined,
      }));
      setEvents(eventsWithDates);
    }
    setLoading(false);
  };

  const handleCreateEvent = async (
    eventData: Omit<Event, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      const supabase = createClient();

      // Extract date and time from the date object
      const eventDateTime = new Date(eventData.date);
      const dateOnly = eventDateTime.toISOString().split("T")[0]; // YYYY-MM-DD
      const timeOnly = eventDateTime.toTimeString().split(" ")[0]; // HH:MM:SS

      const { data, error } = await supabase
        .from("events")
        .insert({
          name: eventData.name,
          location: eventData.location,
          date: dateOnly, // DATE type - just the date part
          time: timeOnly, // TIME type - just the time part
          num_courts: eventData.courtCount.toString(), // TEXT type
          court_count: eventData.courtCount, // SMALLINT type
          team_size: eventData.teamSize,
          rotation_type: eventData.rotationType,
          status: eventData.status,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating event:", error);
        toast.error("Failed to create event", {
          description: error.message,
        });
        return;
      }

      await fetchEvents(); // Refresh the list
      setShowCreateDialog(false);
      toast.success("Event created successfully!");
    } catch (err) {
      console.error("Unexpected error creating event:", err);
      toast.error("Unexpected error", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  const handleUpdateEvent = async (
    eventData: Omit<Event, "id" | "createdAt" | "updatedAt">
  ) => {
    if (!editingEvent) return;

    try {
      const supabase = createClient();

      // Extract date and time from the date object
      const eventDateTime = new Date(eventData.date);
      const dateOnly = eventDateTime.toISOString().split("T")[0]; // YYYY-MM-DD
      const timeOnly = eventDateTime.toTimeString().split(" ")[0]; // HH:MM:SS

      const { error } = await supabase
        .from("events")
        .update({
          name: eventData.name,
          location: eventData.location,
          date: dateOnly, // DATE type - just the date part
          time: timeOnly, // TIME type - just the time part
          num_courts: eventData.courtCount.toString(), // TEXT type
          court_count: eventData.courtCount, // SMALLINT type
          team_size: eventData.teamSize,
          rotation_type: eventData.rotationType,
          status: eventData.status,
        })
        .eq("id", editingEvent.id);

      if (error) {
        console.error("Error updating event:", error);
        toast.error("Failed to update event", {
          description: error.message,
        });
        return;
      }

      await fetchEvents(); // Refresh the list
      setEditingEvent(null);
      toast.success("Event updated successfully!");
    } catch (err) {
      console.error("Unexpected error updating event:", err);
      toast.error("Unexpected error", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  const handleEndEvent = async (eventId: string) => {
    toast("End this event?", {
      description: "This will clear all queue entries and court assignments.",
      action: {
        label: "End Event",
        onClick: async () => {
          try {
            const supabase = createClient();

            // Delete all queue entries for this event
            const { error: queueError } = await supabase
              .from("queue_entries")
              .delete()
              .eq("event_id", eventId);

            if (queueError) {
              console.error("Error clearing queue:", queueError);
              toast.error("Failed to clear queue", {
                description: queueError.message,
              });
              return;
            }

            // Delete all court assignments for this event
            const { error: assignmentsError } = await supabase
              .from("court_assignments")
              .delete()
              .eq("event_id", eventId);

            if (assignmentsError) {
              console.error("Error clearing assignments:", assignmentsError);
              toast.error("Failed to clear assignments", {
                description: assignmentsError.message,
              });
              return;
            }

            // Update event status to ended
            const { error } = await supabase
              .from("events")
              .update({ status: "ended" })
              .eq("id", eventId);

            if (error) {
              console.error("Error ending event:", error);
              toast.error("Failed to end event", {
                description: error.message,
              });
              return;
            }

            await fetchEvents(); // Refresh the list
            toast.success("Event ended successfully!", {
              description: "All queue entries and assignments cleared.",
            });
          } catch (err) {
            console.error("Unexpected error ending event:", err);
            toast.error("Unexpected error", {
              description: err instanceof Error ? err.message : "Unknown error",
            });
          }
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  const handleDeleteEvent = async (eventId: string) => {
    toast("Delete this event?", {
      description:
        "This will remove all queue entries and court assignments. This action cannot be undone.",
      action: {
        label: "Delete",
        onClick: async () => {
          try {
            const supabase = createClient();

            const { error } = await supabase
              .from("events")
              .delete()
              .eq("id", eventId);

            if (error) {
              console.error("Error deleting event:", error);
              toast.error("Failed to delete event", {
                description: error.message,
              });
              return;
            }

            await fetchEvents(); // Refresh the list
            toast.success("Event deleted successfully!");
          } catch (err) {
            console.error("Unexpected error deleting event:", err);
            toast.error("Unexpected error", {
              description: err instanceof Error ? err.message : "Unknown error",
            });
          }
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  const activeEvents = events.filter((e) => e.status === "active");
  const endedEvents = events.filter((e) => e.status === "ended");

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header variant="admin" />
        <div className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            <span className="text-muted-foreground">Loading events...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header variant="admin" />

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
        <div className="grid md:grid-cols-4 gap-6 mb-12">
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

          <Card className="border-border bg-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Email Stats
                  </p>
                  <p className="text-lg font-semibold text-foreground">
                    View Reports
                  </p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/admin/email-stats">View Email Statistics</Link>
              </Button>
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
