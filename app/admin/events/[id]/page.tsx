"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Trophy,
  ArrowLeft,
  Users,
  Clock,
  MapPin,
  Calendar,
  Play,
  Trash2,
  History,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QueueList } from "@/components/queue-list";
import { CourtStatus } from "@/components/court-status";
import { createClient } from "@/lib/supabase/client";
import { leaveQueue, adminRemoveFromQueue } from "@/app/actions/queue";
import type { Event, QueueEntry, CourtAssignment } from "@/lib/types";
import Image from "next/image";

export default function AdminEventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const [event, setEvent] = useState<Event | null>(null);
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [assignments, setAssignments] = useState<CourtAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching event:", error);
        setError("Failed to load event");
        setLoading(false);
        return;
      }

      if (data) {
        // Parse date and time
        const eventDate = new Date(data.date);
        if (data.time) {
          const timeParts = data.time.split(":");
          eventDate.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]));
        }

        setEvent({
          id: data.id,
          name: data.name,
          location: data.location,
          date: eventDate,
          courtCount:
            parseInt(data.court_count) || parseInt(data.num_courts) || 0,
          rotationType: data.rotation_type,
          status: data.status,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at || data.created_at),
        });
      }
      setLoading(false);
    };

    fetchEvent();
  }, [id]);

  // Fetch queue data
  useEffect(() => {
    const fetchQueue = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("queue_entries")
        .select(
          `
          *,
          user:users(id, name, email, skill_level)
        `
        )
        .eq("event_id", id)
        .order("position");

      if (error) {
        console.error("Error fetching queue:", error);
        return;
      }

      if (data) {
        const queueEntries: QueueEntry[] = data.map((entry) => ({
          id: entry.id,
          eventId: entry.event_id,
          userId: entry.user_id,
          groupSize: entry.group_size || 1,
          groupId: entry.group_id,
          position: entry.position,
          status: entry.status,
          joinedAt: new Date(entry.joined_at),
          user: entry.user
            ? {
                id: entry.user.id,
                name: entry.user.name,
                email: entry.user.email,
                skillLevel: entry.user.skill_level,
                isAdmin: false,
                createdAt: new Date(),
              }
            : undefined,
        }));
        setQueue(queueEntries);
      }
    };

    fetchQueue();

    // Set up real-time subscription
    const supabase = createClient();
    const channel = supabase
      .channel(`admin-queue-${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "queue_entries",
          filter: `event_id=eq.${id}`,
        },
        () => {
          fetchQueue();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  // Fetch court assignments
  useEffect(() => {
    const fetchAssignments = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("court_assignments")
        .select(
          `
          *,
          player1:users!court_assignments_player1_id_fkey(id, name, email, skill_level),
          player2:users!court_assignments_player2_id_fkey(id, name, email, skill_level),
          player3:users!court_assignments_player3_id_fkey(id, name, email, skill_level),
          player4:users!court_assignments_player4_id_fkey(id, name, email, skill_level)
        `
        )
        .eq("event_id", id)
        .order("court_number");

      if (error) {
        console.error("Error fetching assignments:", error);
        return;
      }

      if (data) {
        const courtAssignments: CourtAssignment[] = data.map((assignment) => ({
          id: assignment.id,
          eventId: assignment.event_id,
          courtNumber: assignment.court_number,
          player1Id: assignment.player1_id,
          player2Id: assignment.player2_id,
          player3Id: assignment.player3_id,
          player4Id: assignment.player4_id,
          startedAt: new Date(assignment.started_at),
          endedAt: assignment.ended_at
            ? new Date(assignment.ended_at)
            : undefined,
          player1: assignment.player1
            ? {
                id: assignment.player1.id,
                name: assignment.player1.name,
                email: assignment.player1.email,
                skillLevel: assignment.player1.skill_level,
                isAdmin: false,
                createdAt: new Date(),
              }
            : undefined,
          player2: assignment.player2
            ? {
                id: assignment.player2.id,
                name: assignment.player2.name,
                email: assignment.player2.email,
                skillLevel: assignment.player2.skill_level,
                isAdmin: false,
                createdAt: new Date(),
              }
            : undefined,
          player3: assignment.player3
            ? {
                id: assignment.player3.id,
                name: assignment.player3.name,
                email: assignment.player3.email,
                skillLevel: assignment.player3.skill_level,
                isAdmin: false,
                createdAt: new Date(),
              }
            : undefined,
          player4: assignment.player4
            ? {
                id: assignment.player4.id,
                name: assignment.player4.name,
                email: assignment.player4.email,
                skillLevel: assignment.player4.skill_level,
                isAdmin: false,
                createdAt: new Date(),
              }
            : undefined,
        }));
        setAssignments(courtAssignments);
      }
    };

    fetchAssignments();

    // Set up real-time subscription
    const supabase = createClient();
    const channel = supabase
      .channel(`admin-assignments-${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "court_assignments",
          filter: `event_id=eq.${id}`,
        },
        () => {
          fetchAssignments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  const waitingCount = queue.filter((e) => e.status === "waiting").length;
  const playingCount = assignments.filter((a) => !a.endedAt).length * 4;

  const handleAssignNext = async () => {
    if (!event) return;

    // Get the next 4 players from queue
    const nextPlayers = queue.filter((e) => e.status === "waiting").slice(0, 4);

    if (nextPlayers.length < 4) {
      alert("Not enough players in queue (need 4 players)");
      return;
    }

    // Find an available court
    const availableCourt =
      assignments.length === 0
        ? 1
        : assignments.filter((a) => !a.endedAt).length < event.courtCount
        ? Math.max(...assignments.map((a) => a.courtNumber)) + 1
        : null;

    if (availableCourt === null) {
      alert("No available courts. End a game first.");
      return;
    }

    try {
      const supabase = createClient();

      // Create court assignment
      const { error: assignmentError } = await supabase
        .from("court_assignments")
        .insert({
          event_id: id,
          court_number: availableCourt,
          player1_id: nextPlayers[0].userId,
          player2_id: nextPlayers[1].userId,
          player3_id: nextPlayers[2].userId,
          player4_id: nextPlayers[3].userId,
          started_at: new Date().toISOString(),
        });

      if (assignmentError) {
        console.error("Error creating assignment:", assignmentError);
        alert(`Failed to assign players: ${assignmentError.message}`);
        return;
      }

      // Update queue entries to "playing"
      for (const player of nextPlayers) {
        await supabase
          .from("queue_entries")
          .update({ status: "playing" })
          .eq("id", player.id);
      }

      alert(`Assigned 4 players to Court ${availableCourt}`);
    } catch (err) {
      console.error("Error assigning players:", err);
      alert("Failed to assign players");
    }
  };

  const handleForceRemove = async (entryId: string) => {
    console.log(
      "🔍 [ADMIN PAGE] handleForceRemove called with entryId:",
      entryId
    );

    if (
      !confirm("Are you sure you want to remove this player from the queue?")
    ) {
      console.log("🔍 [ADMIN PAGE] User cancelled removal");
      return;
    }

    try {
      console.log("🔍 [ADMIN PAGE] Calling adminRemoveFromQueue...");
      const { error } = await adminRemoveFromQueue(entryId, "Admin removal");

      console.log("🔍 [ADMIN PAGE] adminRemoveFromQueue result:", { error });

      if (error) {
        console.error("❌ [ADMIN PAGE] Error removing player:", error);
        alert(`Failed to remove player: ${error}`);
      } else {
        console.log("✅ [ADMIN PAGE] Player removed successfully");
        alert("Player removed from queue");
      }
    } catch (err) {
      console.error("❌ [ADMIN PAGE] Exception in handleForceRemove:", err);
      alert("Failed to remove player");
    }
  };

  const handleClearQueue = async () => {
    if (
      !confirm(
        "Are you sure you want to clear the entire queue? This cannot be undone."
      )
    ) {
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("queue_entries")
        .delete()
        .eq("event_id", id)
        .eq("status", "waiting");

      if (error) {
        console.error("Error clearing queue:", error);
        alert(`Failed to clear queue: ${error.message}`);
      } else {
        alert("Queue cleared successfully");
      }
    } catch (err) {
      console.error("Error clearing queue:", err);
      alert("Failed to clear queue");
    }
  };

  const handleEndGame = async (assignmentId: string) => {
    if (!confirm("Mark this game as complete?")) return;

    try {
      const supabase = createClient();

      // End the assignment
      const { error: endError } = await supabase
        .from("court_assignments")
        .update({ ended_at: new Date().toISOString() })
        .eq("id", assignmentId);

      if (endError) {
        console.error("Error ending game:", endError);
        alert(`Failed to end game: ${endError.message}`);
        return;
      }

      // Get the assignment to find player IDs
      const assignment = assignments.find((a) => a.id === assignmentId);
      if (!assignment) return;

      // Remove players from queue
      const playerIds = [
        assignment.player1Id,
        assignment.player2Id,
        assignment.player3Id,
        assignment.player4Id,
      ].filter(Boolean);

      for (const playerId of playerIds) {
        await supabase
          .from("queue_entries")
          .delete()
          .eq("event_id", id)
          .eq("user_id", playerId);
      }

      alert("Game ended successfully");
    } catch (err) {
      console.error("Error ending game:", err);
      alert("Failed to end game");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="text-muted-foreground">Loading event...</span>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Event Not Found
            </h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button asChild>
              <Link href="/admin">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Admin
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2">
            <Image
              src="/icon-32x32.png"
              alt="Ghost Mammoths PB"
              width={32}
              height={32}
            />
            <span className="text-xl font-bold text-foreground">
              Ghost Mammoths PB
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Badge variant="default">Admin View</Badge>
            <Button variant="outline" asChild>
              <Link href={`/events/${id}`}>View Public Page</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" className="mb-4" asChild>
          <Link href="/admin">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin Dashboard
          </Link>
        </Button>

        {/* Event Header */}
        <Card className="border-border mb-8">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {event.name}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{event.date.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>
                      {event.date.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    <span>{event.courtCount} Courts</span>
                  </div>
                </div>
              </div>
              <Badge
                variant={event.status === "active" ? "default" : "secondary"}
              >
                {event.status}
              </Badge>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-sm text-muted-foreground">
                  {waitingCount} Waiting
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm text-muted-foreground">
                  {playingCount} Playing
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Court Status */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Courts</h2>
            <CourtStatus
              assignments={assignments}
              courtCount={event.courtCount}
              // onEndGame={handleEndGame}
            />
          </div>

          {/* Queue */}
          <div>
            <Card className="border-border mb-4">
              <CardContent className="p-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-foreground">
                      {waitingCount}
                    </p>
                    <p className="text-sm text-muted-foreground">In Queue</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-foreground">
                      {Math.ceil(waitingCount / 4)}
                    </p>
                    <p className="text-sm text-muted-foreground">Full Games</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-foreground">
                      {waitingCount > 0
                        ? Math.ceil((waitingCount / 4) * 15)
                        : 0}
                      m
                    </p>
                    <p className="text-sm text-muted-foreground">Est. Wait</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2 mb-4">
              <Button onClick={handleAssignNext} size="lg" className="flex-1">
                <Play className="w-4 h-4 mr-2" />
                Assign Next Players
              </Button>
              <Button
                onClick={handleClearQueue}
                size="lg"
                variant="destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Queue
              </Button>
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-4">Queue</h2>
            {queue.length === 0 ? (
              <Card className="border-border">
                <CardContent className="p-12 text-center">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No players in queue</p>
                </CardContent>
              </Card>
            ) : (
              <QueueList
                queue={queue}
                onRemove={handleForceRemove}
                currentUserId=""
                isAdmin={true}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
