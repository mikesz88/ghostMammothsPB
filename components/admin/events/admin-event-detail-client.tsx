"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Trophy,
  Users,
  Clock,
  MapPin,
  Calendar,
  Play,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  adminRemoveFromQueue,
  assignPlayersToNextCourt,
  endGameAndReorderQueue,
} from "@/app/actions/queue";
import { TestControls } from "@/app/admin/events/[id]/test-controls";
import { CourtStatus } from "@/components/court-status";
import { QueueList } from "@/components/queue-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/ui/header";
import {
  hydrateAdminSerializedAssignments,
  hydrateAdminSerializedEvent,
  hydrateAdminSerializedQueue,
} from "@/lib/admin/hydrate-admin-event-detail";
import {
  ADMIN_COURT_ASSIGNMENTS_SELECT,
  mapAdminCourtAssignmentRows,
  type AdminCourtAssignmentWithPlayers,
} from "@/lib/admin/map-admin-court-assignments";
import {
  adminQueueQueryKey,
  fetchAdminQueueEntries,
} from "@/lib/admin-queue";
import { createClient } from "@/lib/supabase/client";

import type { AdminEventDetailPagePayload } from "@/lib/admin/admin-event-detail-server";
import type { CourtAssignment, Event } from "@/lib/types";

export function AdminEventDetailClient({
  eventId,
  initialEvent,
  initialAssignments,
  initialQueue,
  isTestEvent,
}: AdminEventDetailPagePayload) {
  const event = useMemo(
    () => hydrateAdminSerializedEvent(initialEvent),
    [initialEvent],
  );

  const [assignments, setAssignments] = useState<CourtAssignment[]>(() =>
    hydrateAdminSerializedAssignments(initialAssignments),
  );

  const queryClient = useQueryClient();

  const hydratedInitialQueue = useMemo(
    () => hydrateAdminSerializedQueue(initialQueue),
    [initialQueue],
  );

  const { data: queue = hydratedInitialQueue } = useQuery({
    queryKey: adminQueueQueryKey(eventId),
    queryFn: () => fetchAdminQueueEntries(eventId),
    enabled: Boolean(eventId),
    initialData: hydratedInitialQueue,
    staleTime: 30_000,
  });

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`admin-queue-${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "queue_entries",
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          void queryClient.invalidateQueries({
            queryKey: adminQueueQueryKey(eventId),
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, queryClient]);

  useEffect(() => {
    const fetchAssignments = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("court_assignments")
        .select(ADMIN_COURT_ASSIGNMENTS_SELECT)
        .eq("event_id", eventId)
        .order("court_number");

      if (error) {
        console.error("Error fetching assignments:", error);
        return;
      }

      if (data) {
        setAssignments(
          mapAdminCourtAssignmentRows(
            data as AdminCourtAssignmentWithPlayers[],
          ),
        );
      }
    };

    fetchAssignments();

    const supabase = createClient();
    const channel = supabase
      .channel(`admin-assignments-${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "court_assignments",
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          fetchAssignments();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  const waitingCount = queue.filter(
    (e) => e.status === "waiting" || e.status === "pending_solo",
  ).length;
  const playingCount =
    assignments.filter((a) => !a.endedAt).length * event.teamSize * 2;

  const handleAssignNext = async () => {
    try {
      const result = await assignPlayersToNextCourt(eventId);

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
          },
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
      const { error } = await adminRemoveFromQueue(entryId);

      if (error) {
        toast.error("Failed to remove player", {
          description: error,
        });
      } else {
        toast.success("Player removed from queue");
        await queryClient.invalidateQueries({
          queryKey: adminQueueQueryKey(eventId),
        });
      }
    } catch (err) {
      console.error("❌ [ADMIN PAGE] Exception in handleForceRemove:", err);
      toast.error("Failed to remove player");
    }
  };

  const handleClearQueue = async () => {
    if (
      !confirm(
        "Are you sure you want to clear the entire queue? This cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const supabase = createClient();
      await supabase
        .from("court_pending_stayers")
        .delete()
        .eq("event_id", eventId);

      const { error } = await supabase
        .from("queue_entries")
        .delete()
        .eq("event_id", eventId)
        .in("status", ["waiting", "pending_solo"]);

      if (error) {
        console.error("Error clearing queue:", error);
        toast.error("Failed to clear queue", {
          description: error.message,
        });
      } else {
        toast.success("Queue cleared successfully");
        await queryClient.invalidateQueries({
          queryKey: adminQueueQueryKey(eventId),
        });
      }
    } catch (err) {
      console.error("Error clearing queue:", err);
      toast.error("Failed to clear queue");
    }
  };

  const handleEndGame = async (
    assignmentId: string,
    winningTeam: "team1" | "team2",
  ) => {
    const winningTeamName = winningTeam === "team1" ? "Team 1" : "Team 2";

    toast(`Mark this game as complete?`, {
      description: `${winningTeamName} wins!`,
      action: {
        label: "End Game",
        onClick: async () => {
          await performEndGame(event, assignmentId, winningTeam);
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  const performEndGame = async (
    ev: Event,
    assignmentId: string,
    winningTeam: "team1" | "team2",
  ) => {
    try {
      const result = await endGameAndReorderQueue(
        eventId,
        assignmentId,
        winningTeam,
      );

      if (!result.success) {
        toast.error(result.error || "Failed to end game");
        return;
      }

      if (ev.rotationType === "rotate-all") {
        toast.success(
          "Game ended — players re-queued (others first, then court order).",
          {
            description: "Use Assign Next to start the next game.",
          },
        );
      } else if (ev.rotationType === "2-stay-2-off") {
        toast.success(
          "Game ended — winners stay and will split to opposite teams; losers re-queued.",
          {
            description: "Use Assign Next to fill partner spots from the queue.",
          },
        );
      } else if (ev.rotationType === "winners-stay") {
        toast.success(
          "Game ended — winners stay on this court; losers re-queued.",
          {
            description: "Use Assign Next to fill the court from the queue.",
          },
        );
      } else {
        toast.success("Game ended.", {
          description: "Use Assign Next to start the next game.",
        });
      }
    } catch (err) {
      console.error("Error ending game:", err);
      toast.error("Failed to end game");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        variant="admin"
        backButton={{ href: "/admin", label: "Back to Dashboard" }}
      />

      <div className="container mx-auto px-4 py-8">
        {isTestEvent ? (
          <div className="mb-8">
            <TestControls
              eventId={eventId}
              currentRotationType={event.rotationType}
              currentTeamSize={event.teamSize}
              currentCourtCount={event.courtCount}
              onQueueUpdated={() =>
                void queryClient.invalidateQueries({
                  queryKey: adminQueueQueryKey(eventId),
                })
              }
            />
          </div>
        ) : null}

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
