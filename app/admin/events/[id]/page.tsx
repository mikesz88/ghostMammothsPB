"use client";

import { useState, useEffect, use } from "react";
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
import { TestControls } from "./test-controls";
import { Header } from "@/components/ui/header";
import { createClient } from "@/lib/supabase/client";
import {
  leaveQueue,
  adminRemoveFromQueue,
  reorderQueue,
} from "@/app/actions/queue";
import { sendQueueNotification } from "@/app/actions/notifications";
import type { Event, QueueEntry, CourtAssignment } from "@/lib/types";
import { QueueManager } from "@/lib/queue-manager";
import { toast } from "sonner";

export default function AdminEventDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = use(props.params);
  const { id } = params;
  const [event, setEvent] = useState<Event | null>(null);
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [assignments, setAssignments] = useState<CourtAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTestEvent, setIsTestEvent] = useState(false);

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

        const eventData = {
          id: data.id,
          name: data.name,
          location: data.location,
          date: eventDate,
          courtCount:
            parseInt(data.court_count) || parseInt(data.num_courts) || 0,
          teamSize: data.team_size || 2,
          rotationType: data.rotation_type,
          status: data.status,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at || data.created_at),
        };

        setEvent(eventData);

        // Check if this is a test event (name contains "DYNAMIC ADMIN TEST EVENT")
        setIsTestEvent(
          data.name.toUpperCase().includes("DYNAMIC ADMIN TEST EVENT")
        );
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
          player_names: entry.player_names || [],
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
          player4:users!court_assignments_player4_id_fkey(id, name, email, skill_level),
          player5:users!court_assignments_player5_id_fkey(id, name, email, skill_level),
          player6:users!court_assignments_player6_id_fkey(id, name, email, skill_level),
          player7:users!court_assignments_player7_id_fkey(id, name, email, skill_level),
          player8:users!court_assignments_player8_id_fkey(id, name, email, skill_level)
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
          player_names: assignment.player_names || [],
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
          queueEntryIds: assignment.queue_entry_ids || [],
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
  const playingCount =
    assignments.filter((a) => !a.endedAt).length * (event?.teamSize || 2) * 2;

  const handleAssignNext = async () => {
    if (!event) return;

    const playersPerCourt = event.teamSize * 2;
    const waitingQueue = queue.filter((e) => e.status === "waiting");
    const nextPlayers = QueueManager.getNextPlayers(
      waitingQueue,
      playersPerCourt
    );

    // Count total players (considering group_size)
    const totalPlayerCount = nextPlayers.reduce(
      (sum, entry) => sum + (entry.groupSize || 1),
      0
    );

    if (totalPlayerCount < playersPerCourt) {
      toast.error("Not enough players in queue", {
        description: `Need ${playersPerCourt} players for ${
          event.teamSize === 1
            ? "solo"
            : event.teamSize === 2
            ? "doubles"
            : event.teamSize === 3
            ? "triplets"
            : "quads"
        }`,
      });
      return;
    }

    // Find an available court - check database directly for fresh data
    const availableCourt = await (async () => {
      const supabase = createClient();
      const { data: activeAssignments } = await supabase
        .from("court_assignments")
        .select("court_number")
        .eq("event_id", id)
        .is("ended_at", null);

      const activeCourts = new Set(
        activeAssignments?.map((a) => a.court_number) || []
      );

      // Find first court number that's not in use
      for (let i = 1; i <= event.courtCount; i++) {
        if (!activeCourts.has(i)) {
          return i;
        }
      }
      return null; // All courts occupied
    })();

    if (availableCourt === null) {
      toast.error("No available courts", {
        description: "End a game first to free up a court.",
      });
      return;
    }

    try {
      const supabase = createClient();

      // Delete any ended assignments for this court to avoid unique constraint violation
      await supabase
        .from("court_assignments")
        .delete()
        .eq("event_id", id)
        .eq("court_number", availableCourt)
        .not("ended_at", "is", null);

      // Create court assignment with dynamic player slots
      const assignmentData: any = {
        event_id: id,
        court_number: availableCourt,
        started_at: new Date().toISOString(),
        player_names: [], // Will be populated below
        queue_entry_ids: nextPlayers.map((p) => p.id), // Track which queue entries were assigned
      };

      // Expand queue entries to individual player slots (handling group_size)
      // Track both userId and names for proper display
      const playerSlots: Array<{
        userId: string;
        name: string;
        skillLevel: string;
      }> = [];

      for (const entry of nextPlayers) {
        const groupSize = entry.groupSize || 1;
        const playerNames = entry.player_names || [];

        // If we have player_names stored, use those
        if (playerNames.length > 0) {
          for (let i = 0; i < groupSize; i++) {
            playerSlots.push({
              userId: entry.userId,
              name: playerNames[i]?.name || entry.user?.name || "Player",
              skillLevel:
                playerNames[i]?.skillLevel ||
                entry.user?.skillLevel ||
                "intermediate",
            });
          }
        } else {
          // Fallback: use the user's name for all slots
          for (let i = 0; i < groupSize; i++) {
            playerSlots.push({
              userId: entry.userId,
              name: entry.user?.name || "Player",
              skillLevel: entry.user?.skillLevel || "intermediate",
            });
          }
        }
      }

      // Store player names for display
      console.log(
        "Assigning players to court:",
        playerSlots.map((p) => p.name)
      );
      assignmentData.player_names = playerSlots.map((p) => p.name);

      // Assign players to slots (using userId for database)
      if (playerSlots[0]) assignmentData.player1_id = playerSlots[0].userId;
      if (playerSlots[1]) assignmentData.player2_id = playerSlots[1].userId;
      if (playerSlots[2]) assignmentData.player3_id = playerSlots[2].userId;
      if (playerSlots[3]) assignmentData.player4_id = playerSlots[3].userId;
      if (playerSlots[4]) assignmentData.player5_id = playerSlots[4].userId;
      if (playerSlots[5]) assignmentData.player6_id = playerSlots[5].userId;
      if (playerSlots[6]) assignmentData.player7_id = playerSlots[6].userId;
      if (playerSlots[7]) assignmentData.player8_id = playerSlots[7].userId;

      const { error: assignmentError } = await supabase
        .from("court_assignments")
        .insert(assignmentData);

      if (assignmentError) {
        console.error("Error creating assignment:", assignmentError);
        toast.error("Failed to assign players", {
          description: assignmentError.message,
        });
        return;
      }

      // Update queue entries to "playing"
      console.log(
        "Updating queue entries to playing:",
        nextPlayers.map((p) => ({
          id: p.id,
          userId: p.userId,
          name: p.user?.name,
        }))
      );

      for (const player of nextPlayers) {
        const { error: updateError } = await supabase
          .from("queue_entries")
          .update({ status: "playing" })
          .eq("id", player.id);

        if (updateError) {
          console.error(`Failed to update player ${player.id}:`, updateError);
        } else {
          console.log(`Updated player ${player.id} to playing`);
        }

        // Send court assignment email notification
        sendQueueNotification(
          player.userId,
          id,
          player.position,
          "court-assignment",
          availableCourt
        ).catch((err) =>
          console.error("Failed to send court assignment email:", err)
        );
      }

      toast.success(
        `Assigned ${playersPerCourt} players to Court ${availableCourt}`
      );

      // Reorder remaining waiting players to fill gaps in positions
      await reorderQueue(id);

      // Real-time subscriptions will automatically update the UI
    } catch (err) {
      console.error("Error assigning players:", err);
      toast.error("Failed to assign players");
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
        toast.error("Failed to remove player", {
          description: error,
        });
      } else {
        console.log("✅ [ADMIN PAGE] Player removed successfully");
        toast.success("Player removed from queue");
      }
    } catch (err) {
      console.error("❌ [ADMIN PAGE] Exception in handleForceRemove:", err);
      toast.error("Failed to remove player");
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
        toast.error("Failed to clear queue", {
          description: error.message,
        });
      } else {
        toast.success("Queue cleared successfully");
      }
    } catch (err) {
      console.error("Error clearing queue:", err);
      toast.error("Failed to clear queue");
    }
  };

  const handleEndGame = async (
    assignmentId: string,
    winningTeam: "team1" | "team2"
  ) => {
    const winningTeamName = winningTeam === "team1" ? "Team 1" : "Team 2";

    toast(`Mark this game as complete?`, {
      description: `${winningTeamName} wins!`,
      action: {
        label: "End Game",
        onClick: async () => {
          await performEndGame(assignmentId, winningTeam);
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  const performEndGame = async (
    assignmentId: string,
    winningTeam: "team1" | "team2"
  ) => {
    try {
      if (!event) return;

      const supabase = createClient();
      const assignment = assignments.find((a) => a.id === assignmentId);
      if (!assignment) {
        toast.error("Assignment not found");
        return;
      }

      // Use QueueManager to determine who stays and who rotates
      const { playersToStay, playersToQueue } =
        QueueManager.handleGameCompletion(
          assignment,
          event.rotationType,
          winningTeam,
          queue
        );

      // 1. Mark the game as ended
      const { error: endError } = await supabase
        .from("court_assignments")
        .update({ ended_at: new Date().toISOString() })
        .eq("id", assignmentId);

      if (endError) {
        console.error("Error ending game:", endError);
        toast.error("Failed to end game");
        return;
      }

      // 2. Get the queue entry IDs that were assigned to this court
      // This is the key fix - we use the stored queue_entry_ids instead of user_ids
      const queueEntryIds = (assignment as any).queueEntryIds || [];

      if (queueEntryIds.length === 0) {
        console.warn(
          "No queue_entry_ids found in assignment, falling back to user_id lookup"
        );
        // Fallback for old assignments that don't have queue_entry_ids
        const allPlayers = [
          assignment.player1Id,
          assignment.player2Id,
          assignment.player3Id,
          assignment.player4Id,
          assignment.player5Id,
          assignment.player6Id,
          assignment.player7Id,
          assignment.player8Id,
        ].filter(Boolean) as string[];

        const { data: entries } = await supabase
          .from("queue_entries")
          .select("id")
          .eq("event_id", id)
          .in("user_id", allPlayers);

        if (entries) {
          queueEntryIds.push(...entries.map((e) => e.id));
        }
      }

      console.log("Queue entries that played:", queueEntryIds);

      // 3. Update all these queue entries to 'waiting' status
      for (const entryId of queueEntryIds) {
        await supabase
          .from("queue_entries")
          .update({ status: "waiting" })
          .eq("id", entryId);
      }

      // 4. Get all current queue entries to determine positioning
      const { data: allQueueEntries } = await supabase
        .from("queue_entries")
        .select("id, user_id, group_size, position")
        .eq("event_id", id)
        .eq("status", "waiting")
        .order("position");

      if (!allQueueEntries) {
        toast.error("Failed to fetch queue entries");
        return;
      }

      // 5. Separate entries into: winners, losers, and others
      const allPlayers = [
        assignment.player1Id,
        assignment.player2Id,
        assignment.player3Id,
        assignment.player4Id,
        assignment.player5Id,
        assignment.player6Id,
        assignment.player7Id,
        assignment.player8Id,
      ].filter(Boolean) as string[];

      // Map user_ids to queue entry IDs (handling duplicates from groups)
      const winnerEntryIds = new Set<string>();
      const loserEntryIds = new Set<string>();

      // For each player who should stay/queue, find their queue entry
      for (const userId of playersToStay) {
        const entry = allQueueEntries.find(
          (e) => e.user_id === userId && queueEntryIds.includes(e.id)
        );
        if (entry) winnerEntryIds.add(entry.id);
      }

      for (const userId of playersToQueue) {
        const entry = allQueueEntries.find(
          (e) => e.user_id === userId && queueEntryIds.includes(e.id)
        );
        if (entry) loserEntryIds.add(entry.id);
      }

      // Get entries that weren't in this game
      const otherEntries = allQueueEntries.filter(
        (e) => !queueEntryIds.includes(e.id)
      );

      console.log("Winners:", Array.from(winnerEntryIds));
      console.log("Losers:", Array.from(loserEntryIds));
      console.log(
        "Others:",
        otherEntries.map((e) => e.id)
      );

      // 6. Reposition entries based on rotation type
      let position = 1;

      // Winners go to front
      for (const entryId of winnerEntryIds) {
        await supabase
          .from("queue_entries")
          .update({ position })
          .eq("id", entryId);
        position++;
      }

      // Other players (not in this game) stay in their relative order
      for (const entry of otherEntries) {
        await supabase
          .from("queue_entries")
          .update({ position })
          .eq("id", entry.id);
        position++;
      }

      // Losers go to back
      for (const entryId of loserEntryIds) {
        await supabase
          .from("queue_entries")
          .update({ position })
          .eq("id", entryId);
        position++;
      }

      const stayCount = Array.from(winnerEntryIds).length;
      toast.success(
        `Game ended! ${stayCount} queue entr${
          stayCount === 1 ? "y" : "ies"
        } moved to front.`,
        {
          description: "Use 'Assign Next' to start the next game.",
        }
      );
    } catch (err) {
      console.error("Error ending game:", err);
      toast.error("Failed to end game");
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
      <Header
        variant="admin"
        backButton={{ href: "/admin", label: "Back to Dashboard" }}
      />

      <div className="container mx-auto px-4 py-8">
        {/* Test Mode Controls */}
        {isTestEvent && (
          <div className="mb-8">
            <TestControls
              eventId={id}
              currentRotationType={event.rotationType}
              currentTeamSize={event.teamSize}
              currentCourtCount={event.courtCount}
            />
          </div>
        )}

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
                    <Users className="w-4 h-4" />
                    <span>
                      {event.teamSize === 1
                        ? "Solo (1v1)"
                        : event.teamSize === 2
                        ? "Doubles (2v2)"
                        : event.teamSize === 3
                        ? "Triplets (3v3)"
                        : "Quads (4v4)"}{" "}
                      •{" "}
                      {event.rotationType
                        .replace("-", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
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
              teamSize={event.teamSize}
              isAdmin={true}
              onCompleteGame={handleEndGame}
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
