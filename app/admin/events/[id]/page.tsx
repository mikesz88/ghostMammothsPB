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
  assignPlayersToNextCourt,
} from "@/app/actions/queue";
import { sendQueueNotification } from "@/app/actions/notifications";
import type { Event, QueueEntry, CourtAssignment, TeamSize, RotationType, EventStatus, GroupSize, QueueStatus, SkillLevel } from "@/lib/types";
import type { Database } from "@/supabase/supa-schema";

type QueueEntryRow = Database["public"]["Tables"]["queue_entries"]["Row"];
type QueueEntryWithUser = QueueEntryRow & { 
  user: {
    id: string;
    name: string;
    email: string;
    skill_level: string;
  } | null;
};

type CourtAssignmentRow = Database["public"]["Tables"]["court_assignments"]["Row"];
type CourtAssignmentWithPlayers = CourtAssignmentRow & {
  player1: { id: string; name: string; email: string; skill_level: string } | null;
  player2: { id: string; name: string; email: string; skill_level: string } | null;
  player3: { id: string; name: string; email: string; skill_level: string } | null;
  player4: { id: string; name: string; email: string; skill_level: string } | null;
  player5: { id: string; name: string; email: string; skill_level: string } | null;
  player6: { id: string; name: string; email: string; skill_level: string } | null;
  player7: { id: string; name: string; email: string; skill_level: string } | null;
  player8: { id: string; name: string; email: string; skill_level: string } | null;
};
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
            parseInt(data.court_count.toString()) || parseInt(data.num_courts) || 0,
          teamSize: (data.team_size || 2) as TeamSize,
          rotationType: data.rotation_type as RotationType,
          status: data.status as EventStatus,
          createdAt: new Date(data.created_at),
          updatedAt: data.updated_at ? new Date(data.updated_at) : undefined,
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
        const queueEntries: QueueEntry[] = data.map((entry: QueueEntryWithUser) => {
          // Parse player_names JSON if it exists
          let playerNamesArray: Array<{ name: string; skillLevel: string }> = [];
          if (entry.player_names) {
            try {
              const parsed = entry.player_names as unknown as Array<{ name: string; skillLevel: string }>;
              playerNamesArray = Array.isArray(parsed) ? parsed : [];
            } catch {
              playerNamesArray = [];
            }
          }
          
          return {
            id: entry.id,
            eventId: entry.event_id,
            userId: entry.user_id,
            groupSize: (entry.group_size || 1) as GroupSize,
            groupId: entry.group_id || undefined,
            player_names: playerNamesArray,
            position: entry.position,
            status: entry.status as QueueStatus,
            joinedAt: new Date(entry.joined_at),
            user: entry.user
              ? {
                  id: entry.user.id,
                  name: entry.user.name,
                  email: entry.user.email,
                  skillLevel: entry.user.skill_level as SkillLevel,
                  isAdmin: false,
                  createdAt: new Date(),
                }
              : undefined,
          };
        });
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
        const courtAssignments: CourtAssignment[] = data.map((assignment: CourtAssignmentWithPlayers) => {
          // Parse player_names and queueEntryIds JSON if they exist
          let playerNamesArray: string[] = [];
          let queueEntryIdsArray: string[] = [];
          
          if (assignment.player_names) {
            try {
              const parsed = assignment.player_names as unknown as string[];
              playerNamesArray = Array.isArray(parsed) ? parsed : [];
            } catch {
              playerNamesArray = [];
            }
          }
          
          if (assignment.queue_entry_ids) {
            try {
              const parsed = assignment.queue_entry_ids as unknown as string[];
              queueEntryIdsArray = Array.isArray(parsed) ? parsed : [];
            } catch {
              queueEntryIdsArray = [];
            }
          }
          
          return {
            id: assignment.id,
            eventId: assignment.event_id || "",
            courtNumber: assignment.court_number,
            player1Id: assignment.player1_id || undefined,
            player2Id: assignment.player2_id || undefined,
            player3Id: assignment.player3_id || undefined,
            player4Id: assignment.player4_id || undefined,
            player5Id: assignment.player5_id || undefined,
            player6Id: assignment.player6_id || undefined,
            player7Id: assignment.player7_id || undefined,
            player8Id: assignment.player8_id || undefined,
            player_names: playerNamesArray,
            queueEntryIds: queueEntryIdsArray,
            startedAt: new Date(assignment.started_at || ""),
            endedAt: assignment.ended_at ? new Date(assignment.ended_at) : undefined,
            player1: assignment.player1
              ? {
                  id: assignment.player1.id,
                  name: assignment.player1.name,
                  email: assignment.player1.email,
                  skillLevel: assignment.player1.skill_level as SkillLevel,
                  isAdmin: false,
                  createdAt: new Date(),
                }
              : undefined,
            player2: assignment.player2
              ? {
                  id: assignment.player2.id,
                  name: assignment.player2.name,
                  email: assignment.player2.email,
                  skillLevel: assignment.player2.skill_level as SkillLevel,
                  isAdmin: false,
                  createdAt: new Date(),
                }
            : undefined,
          player3: assignment.player3
            ? {
                id: assignment.player3.id,
                name: assignment.player3.name,
                email: assignment.player3.email,
                skillLevel: assignment.player3.skill_level as SkillLevel,
                isAdmin: false,
                createdAt: new Date(),
              }
            : undefined,
          player4: assignment.player4
            ? {
                id: assignment.player4.id,
                name: assignment.player4.name,
                email: assignment.player4.email,
                skillLevel: assignment.player4.skill_level as SkillLevel,
                isAdmin: false,
                createdAt: new Date(),
              }
            : undefined,
          player5: assignment.player5
            ? {
                id: assignment.player5.id,
                name: assignment.player5.name,
                email: assignment.player5.email,
                skillLevel: assignment.player5.skill_level as SkillLevel,
                isAdmin: false,
                createdAt: new Date(),
              }
            : undefined,
          player6: assignment.player6
            ? {
                id: assignment.player6.id,
                name: assignment.player6.name,
                email: assignment.player6.email,
                skillLevel: assignment.player6.skill_level as SkillLevel,
                isAdmin: false,
                createdAt: new Date(),
              }
            : undefined,
          player7: assignment.player7
            ? {
                id: assignment.player7.id,
                name: assignment.player7.name,
                email: assignment.player7.email,
                skillLevel: assignment.player7.skill_level as SkillLevel,
                isAdmin: false,
                createdAt: new Date(),
              }
            : undefined,
          player8: assignment.player8
            ? {
                id: assignment.player8.id,
                name: assignment.player8.name,
                email: assignment.player8.email,
                skillLevel: assignment.player8.skill_level as SkillLevel,
                isAdmin: false,
                createdAt: new Date(),
              }
            : undefined,
          };
        });
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

    try {
      const result = await assignPlayersToNextCourt(id);

      if (result.success) {
        const teamSizeText =
          event.teamSize === 1
            ? "solo"
            : event.teamSize === 2
            ? "doubles"
            : event.teamSize === 3
            ? "triplets"
            : "quads";

        toast.success(
          `Assigned ${result.playersAssigned} players to Court ${result.courtNumber}`,
          {
            description: `${teamSizeText} game started`,
          }
        );
      } else {
        toast.error("Failed to assign players", {
          description: result.error,
        });
      }
    } catch (err) {
      console.error("Error assigning players:", err);
      toast.error("Failed to assign players");
    }
  };

  const handleForceRemove = async (entryId: string) => {
    if (
      !confirm("Are you sure you want to remove this player from the queue?")
    ) {
      return;
    }

    try {
      const { error } = await adminRemoveFromQueue(entryId, "Admin removal");

      if (error) {
        console.error("❌ [ADMIN PAGE] Error removing player:", error);
        toast.error("Failed to remove player", {
          description: error,
        });
      } else {
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
          queue,
          event.teamSize
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
      const queueEntryIds = assignment.queueEntryIds || [];

      if (queueEntryIds.length === 0) {
        toast.error("No queue entries recorded for this game");
        return;
      }

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

      // 5. Determine which queue entries belong to which team
      // Since queue entries fill slots sequentially, we can determine team membership
      // by looking at which slots they filled
      const playersPerTeam = event.teamSize;

      // Create a map of which queue entries contributed to which team
      const queueEntryToTeam = new Map<string, "team1" | "team2">();

      // Track which player slots each queue entry filled
      let slotIndex = 0;
      for (const entryId of queueEntryIds) {
        const entry = allQueueEntries.find((e) => e.id === entryId);
        if (entry) {
          const groupSize = entry.group_size || 1;
          // Determine which team this entry's slots belong to
          // Slots 0 to (playersPerTeam-1) = team1
          // Slots playersPerTeam to (2*playersPerTeam-1) = team2
          const startSlot = slotIndex;
          const endSlot = slotIndex + groupSize - 1;

          // If all slots are in team1 range or team2 range, assign accordingly
          if (endSlot < playersPerTeam) {
            queueEntryToTeam.set(entryId, "team1");
          } else if (startSlot >= playersPerTeam) {
            queueEntryToTeam.set(entryId, "team2");
          } else {
            // Entry spans both teams (shouldn't happen with proper assignment)
            if (playersPerTeam - startSlot >= endSlot - playersPerTeam + 1) {
              queueEntryToTeam.set(entryId, "team1");
            } else {
              queueEntryToTeam.set(entryId, "team2");
            }
          }

          slotIndex += groupSize;
        }
      }

      // Separate entries into: winners, losers, and others
      const winnerEntryIds = new Set<string>();
      const loserEntryIds = new Set<string>();

      for (const [entryId, team] of queueEntryToTeam.entries()) {
        if (team === winningTeam) {
          winnerEntryIds.add(entryId);
        } else {
          loserEntryIds.add(entryId);
        }
      }

      // Get entries that weren't in this game
      const otherEntries = allQueueEntries.filter(
        (e) => !queueEntryIds.includes(e.id)
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

      // Final cleanup: reorder queue to ensure no gaps or duplicates
      await reorderQueue(id);

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
