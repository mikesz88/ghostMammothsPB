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
  Bell,
  RefreshCw,
  Settings,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { QueueList } from "@/components/queue-list";
import { CourtStatus } from "@/components/court-status";
import { JoinQueueDialog } from "@/components/join-queue-dialog";
import { QueuePositionAlert } from "@/components/queue-position-alert";
import { NotificationPrompt } from "@/components/notification-prompt";
import { QueueManager } from "@/lib/queue-manager";
import { useNotifications } from "@/lib/use-notifications";
import { useRealtimeQueue } from "@/lib/hooks/use-realtime-queue";
import { useAuth } from "@/lib/auth-context";
import { joinQueue, leaveQueue } from "@/app/actions/queue";
import { createClient } from "@/lib/supabase/client";
import { canUserJoinEvent, formatPrice } from "@/lib/membership-helpers";
import { Header } from "@/components/ui/header";
import type { Event, QueueEntry, CourtAssignment } from "@/lib/types";

export default function EventDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = use(props.params);
  const { id } = params;
  const [event, setEvent] = useState<Event | null>(null);
  const [assignments, setAssignments] = useState<CourtAssignment[]>([]);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastPosition, setLastPosition] = useState<number>(0);
  const [canJoin, setCanJoin] = useState(true);
  const [joinReason, setJoinReason] = useState<string | undefined>();
  const [requiresPayment, setRequiresPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number | undefined>();

  const { user } = useAuth();
  const {
    queue,
    loading: queueLoading,
    refetch: refetchQueue,
  } = useRealtimeQueue(id);
  const { sendNotification } = useNotifications();

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
        setError("Event not found");
        console.error("Error fetching event:", error);
      } else {
        // Convert date strings to Date objects and map snake_case to camelCase
        const eventWithDate = {
          ...data,
          date:
            data.date && data.time
              ? new Date(`${data.date}T${data.time}`)
              : new Date(data.date),
          courtCount:
            parseInt(data.court_count) || parseInt(data.num_courts) || 0,
          teamSize: data.team_size || 2,
          rotationType: data.rotation_type,
          createdAt: new Date(data.created_at),
          updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
        };
        setEvent(eventWithDate);
      }
      setLoading(false);
    };

    fetchEvent();
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
          player1:users!player1_id(*),
          player2:users!player2_id(*),
          player3:users!player3_id(*),
          player4:users!player4_id(*),
          player5:users!player5_id(*),
          player6:users!player6_id(*),
          player7:users!player7_id(*),
          player8:users!player8_id(*)
        `
        )
        .eq("event_id", id)
        .is("ended_at", null);

      if (error) {
        console.error("Error fetching assignments:", error);
      } else {
        setAssignments(data || []);
      }
    };

    fetchAssignments();
  }, [id]);

  // Check if user can join event based on membership
  useEffect(() => {
    const checkAccess = async () => {
      if (user && event) {
        const access = await canUserJoinEvent(user.id, id);
        setCanJoin(access.canJoin);
        setJoinReason(access.reason);
        setRequiresPayment(access.requiresPayment);
        setPaymentAmount(access.amount);
      }
    };

    checkAccess();
  }, [user, event, id]);

  // Get current user's queue position
  const currentUserEntry = queue.find(
    (e) => e.userId === user?.id && e.status === "waiting"
  );
  const userPosition = currentUserEntry?.position || 0;
  const isUpNext = userPosition > 0 && userPosition <= 4;

  // Handle position change notifications
  useEffect(() => {
    if (userPosition > 0 && lastPosition > 0 && userPosition < lastPosition) {
      if (userPosition <= 4) {
        sendNotification("up-next", "Almost Your Turn!", {
          body: `You're now #${userPosition} in the queue. Get ready to play!`,
          tag: "queue-position",
        });
      } else {
        sendNotification("position-change", "Queue Position Updated", {
          body: `You moved up to position #${userPosition}`,
          tag: "queue-position",
        });
      }
    }
    if (userPosition > 0) {
      setLastPosition(userPosition);
    }
  }, [userPosition, lastPosition, sendNotification]);

  const waitingCount = queue.filter((e) => e.status === "waiting").length;
  const playingCount =
    assignments.filter((a) => !a.endedAt).length * (event?.teamSize || 2) * 2;

  const handleJoinQueue = async (
    players: Array<{ name: string; skillLevel: string }>,
    groupSize: number
  ) => {
    if (!user) return;

    try {
      // Generate a unique group ID if joining as a group
      const groupId = groupSize > 1 ? crypto.randomUUID() : undefined;

      // Add the current user to the queue with group information
      // Note: Currently only the authenticated user is added to the database
      // The other player names are stored in the dialog but not persisted
      // This is intentional - only registered users can join the queue
      const { error } = await joinQueue(id, user.id, groupSize, groupId);

      if (error) {
        console.error("Error joining queue:", error);
        alert("Failed to join queue. Please try again.");
      } else {
        setShowJoinDialog(false);

        // Manually refetch queue to ensure UI updates immediately
        await refetchQueue();

        const groupText = groupSize > 1 ? ` as a group of ${groupSize}` : "";
        sendNotification("queue-join", "Successfully Joined Queue", {
          body: `You're now in position #${waitingCount + 1}${groupText} for ${
            event?.name
          }`,
          tag: "queue-join",
        });
      }
    } catch (err) {
      console.error("Error joining queue:", err);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  const handleLeaveQueue = async (entryId: string) => {
    try {
      const { error } = await leaveQueue(entryId);
      if (error) {
        console.error("Error leaving queue:", error);
        alert("Failed to leave queue. Please try again.");
      } else {
        // Manually refetch queue to ensure UI updates immediately
        await refetchQueue();

        sendNotification("queue-leave", "Left Queue", {
          body: `You've been removed from the queue for ${event?.name}`,
          tag: "queue-leave",
        });
      }
    } catch (err) {
      console.error("Error leaving queue:", err);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2 text-muted-foreground">Loading event...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              Event Not Found
            </h1>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button asChild>
              <Link href="/events">Back to Events</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header backButton={{ href: "/events", label: "Back to Events" }} />

      {/* Event Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                {event.name}
              </h1>
              <div className="flex flex-wrap gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {event.location}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(event.date).toLocaleDateString()} at{" "}
                  {new Date(event.date).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
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
                </div>
              </div>
            </div>
            <Badge variant="default" className="text-sm">
              {event.status}
            </Badge>
          </div>

          <div className="mb-4">
            <NotificationPrompt />
          </div>

          {userPosition > 0 && (
            <div className="mb-6">
              <QueuePositionAlert position={userPosition} isUpNext={isUpNext} />
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <Card className="border-border bg-background">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {waitingCount}
                    </p>
                    <p className="text-sm text-muted-foreground">In Queue</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-background">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {playingCount}
                    </p>
                    <p className="text-sm text-muted-foreground">Playing Now</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-background">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {QueueManager.estimateWaitTime(
                        waitingCount,
                        event.courtCount,
                        event.teamSize
                      )}
                      m
                    </p>
                    <p className="text-sm text-muted-foreground">Est. Wait</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Court Status */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground">
                Court Status
              </h2>
              <Badge variant="outline">{event.courtCount} courts</Badge>
            </div>
            <CourtStatus
              courtCount={event.courtCount}
              assignments={assignments}
              teamSize={event.teamSize}
            />
          </div>

          {/* Queue */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-foreground">Queue</h2>
              {userPosition > 0 ? (
                <Badge variant="default" className="text-sm">
                  <Bell className="w-3 h-3 mr-1" />
                  You're #{userPosition}
                </Badge>
              ) : (
                <>
                  {!canJoin && joinReason ? (
                    <div className="flex flex-col items-end gap-2">
                      <p className="text-sm text-muted-foreground">
                        {joinReason}
                      </p>
                      <Button variant="default" asChild>
                        <Link href="/membership">Upgrade Membership</Link>
                      </Button>
                    </div>
                  ) : requiresPayment && paymentAmount ? (
                    <div className="flex flex-col items-end gap-2">
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(paymentAmount)} to join
                      </p>
                      <Button
                        onClick={() => setShowJoinDialog(true)}
                        disabled={!user}
                      >
                        Pay & Join Queue
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setShowJoinDialog(true)}
                      disabled={!user}
                    >
                      Join Queue
                    </Button>
                  )}
                </>
              )}
            </div>
            {queueLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="ml-2 text-muted-foreground">
                  Loading queue...
                </span>
              </div>
            ) : (
              <QueueList
                queue={queue}
                onRemove={handleLeaveQueue}
                currentUserId={user?.id || ""}
              />
            )}
          </div>
        </div>
      </div>

      <JoinQueueDialog
        open={showJoinDialog}
        onOpenChange={setShowJoinDialog}
        onJoin={handleJoinQueue}
        eventTeamSize={event.teamSize}
      />
    </div>
  );
}
