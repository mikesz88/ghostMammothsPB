"use client";

import { useState, useEffect, useCallback } from "react";
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
import { useQueuePolling } from "@/lib/use-queue-polling";
import { useNotifications } from "@/lib/use-notifications";
import type { Event, QueueEntry, CourtAssignment } from "@/lib/types";

// Mock data
const mockEvent: Event = {
  id: "1",
  name: "Saturday Morning Doubles",
  location: "Central Park Courts",
  date: new Date("2025-10-04T09:00:00"),
  courtCount: 4,
  rotationType: "2-stay-4-off",
  status: "active",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockQueue: QueueEntry[] = [
  {
    id: "1",
    eventId: "1",
    userId: "u1",
    groupSize: 1,
    position: 1,
    status: "waiting",
    joinedAt: new Date(),
    user: {
      id: "u1",
      name: "Alex Johnson",
      email: "alex@example.com",
      skillLevel: "advanced",
      isAdmin: false,
      createdAt: new Date(),
    },
  },
  {
    id: "2",
    eventId: "1",
    userId: "u2",
    groupSize: 1,
    position: 2,
    status: "waiting",
    joinedAt: new Date(),
    user: {
      id: "u2",
      name: "Sam Chen",
      email: "sam@example.com",
      skillLevel: "intermediate",
      isAdmin: false,
      createdAt: new Date(),
    },
  },
  {
    id: "3",
    eventId: "1",
    userId: "u3",
    groupSize: 2,
    position: 3,
    status: "waiting",
    joinedAt: new Date(),
    groupId: "g1",
    user: {
      id: "u3",
      name: "Jordan Lee",
      email: "jordan@example.com",
      skillLevel: "advanced",
      isAdmin: false,
      createdAt: new Date(),
    },
  },
  {
    id: "4",
    eventId: "1",
    userId: "u4",
    groupSize: 2,
    position: 4,
    status: "waiting",
    joinedAt: new Date(),
    groupId: "g1",
    user: {
      id: "u4",
      name: "Taylor Kim",
      email: "taylor@example.com",
      skillLevel: "advanced",
      isAdmin: false,
      createdAt: new Date(),
    },
  },
];

const mockAssignments: CourtAssignment[] = [
  {
    id: "a1",
    eventId: "1",
    courtNumber: 1,
    player1Id: "p1",
    player2Id: "p2",
    player3Id: "p3",
    player4Id: "p4",
    startedAt: new Date(),
    player1: {
      id: "p1",
      name: "Chris Martinez",
      email: "chris@example.com",
      skillLevel: "pro",
      isAdmin: false,
      createdAt: new Date(),
    },
    player2: {
      id: "p2",
      name: "Morgan Davis",
      email: "morgan@example.com",
      skillLevel: "advanced",
      isAdmin: false,
      createdAt: new Date(),
    },
    player3: {
      id: "p3",
      name: "Riley Brown",
      email: "riley@example.com",
      skillLevel: "advanced",
      isAdmin: false,
      createdAt: new Date(),
    },
    player4: {
      id: "p4",
      name: "Casey Wilson",
      email: "casey@example.com",
      skillLevel: "intermediate",
      isAdmin: false,
      createdAt: new Date(),
    },
  },
  {
    id: "a2",
    eventId: "1",
    courtNumber: 2,
    player1Id: "p5",
    player2Id: "p6",
    player3Id: "p7",
    player4Id: "p8",
    startedAt: new Date(),
    player1: {
      id: "p5",
      name: "Jamie Anderson",
      email: "jamie@example.com",
      skillLevel: "intermediate",
      isAdmin: false,
      createdAt: new Date(),
    },
    player2: {
      id: "p6",
      name: "Drew Taylor",
      email: "drew@example.com",
      skillLevel: "beginner",
      isAdmin: false,
      createdAt: new Date(),
    },
    player3: {
      id: "p7",
      name: "Avery Moore",
      email: "avery@example.com",
      skillLevel: "intermediate",
      isAdmin: false,
      createdAt: new Date(),
    },
    player4: {
      id: "p8",
      name: "Quinn Jackson",
      email: "quinn@example.com",
      skillLevel: "advanced",
      isAdmin: false,
      createdAt: new Date(),
    },
  },
];

export default function EventDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const [event] = useState<Event>(mockEvent);
  const [queue, setQueue] = useState<QueueEntry[]>(mockQueue);
  const [assignments] = useState<CourtAssignment[]>(mockAssignments);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [currentUserId] = useState("u1");
  const [lastPosition, setLastPosition] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { sendNotification } = useNotifications();

  const waitingCount = queue.filter((e) => e.status === "waiting").length;
  const playingCount = assignments.filter((a) => !a.endedAt).length * 4;

  const currentUserEntry = queue.find(
    (e) => e.userId === currentUserId && e.status === "waiting"
  );
  const userPosition = currentUserEntry?.position || 0;
  const isUpNext = userPosition > 0 && userPosition <= 4;

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

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  }, []);

  useQueuePolling({
    onUpdate: handleRefresh,
    interval: 10000,
    enabled: true,
  });

  const handleJoinQueue = (
    players: Array<{ name: string; skillLevel: string }>,
    groupSize: number
  ) => {
    const groupId = groupSize > 1 ? Math.random().toString() : undefined;
    const basePosition = queue.length + 1;

    const newEntries: QueueEntry[] = players.map((player, index) => ({
      id: Math.random().toString(),
      eventId: id,
      userId: Math.random().toString(),
      groupId,
      groupSize: groupSize as 1 | 2 | 3 | 4,
      position: basePosition + index,
      status: "waiting",
      joinedAt: new Date(),
      user: {
        id: Math.random().toString(),
        name: player.name,
        email: `${player.name.toLowerCase().replace(" ", ".")}@example.com`,
        skillLevel: player.skillLevel as any,
        isAdmin: false,
        createdAt: new Date(),
      },
    }));

    setQueue([...queue, ...newEntries]);
    setShowJoinDialog(false);

    sendNotification("queue-join", "Successfully Joined Queue", {
      body: `You're now in position #${basePosition} for ${event.name}`,
      tag: "queue-join",
    });
  };

  const handleLeaveQueue = (entryId: string) => {
    const entry = queue.find((e) => e.id === entryId);
    if (!entry) return;

    const entriesToRemove = entry.groupId
      ? queue.filter((e) => e.groupId === entry.groupId)
      : [entry];

    const updatedQueue = queue.filter(
      (e) => !entriesToRemove.some((r) => r.id === e.id)
    );

    const reorderedQueue = QueueManager.reorderQueue(updatedQueue);
    setQueue(reorderedQueue);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Ghost Mammoths PB
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/settings/notifications">
                <Settings className="w-4 h-4" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/events">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Events
              </Link>
            </Button>
          </div>
        </div>
      </header>

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
                  {event.date.toLocaleDateString()} at{" "}
                  {event.date.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
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
                        event.courtCount
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
                <Button onClick={() => setShowJoinDialog(true)}>
                  Join Queue
                </Button>
              )}
            </div>
            <QueueList
              queue={queue}
              onRemove={handleLeaveQueue}
              currentUserId={currentUserId}
            />
          </div>
        </div>
      </div>

      <JoinQueueDialog
        open={showJoinDialog}
        onOpenChange={setShowJoinDialog}
        onJoin={handleJoinQueue}
      />
    </div>
  );
}
