"use client";

import { Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

import { CourtStatus } from "@/components/court-status";
import { EventDetailHero } from "@/components/events/event-detail-hero";
import { EventDetailQrDialog } from "@/components/events/event-detail-qr-dialog";
import { EventDetailStatsRow } from "@/components/events/event-detail-stats-row";
import { EventQueueHeaderRow } from "@/components/events/event-queue-header-row";
import { JoinQueueDialog } from "@/components/join-queue-dialog";
import { NotificationPrompt } from "@/components/notification-prompt";
import { QueueList } from "@/components/queue-list";
import { QueuePositionAlert } from "@/components/queue-position-alert";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/ui/header";
import { useAuth } from "@/lib/auth-context";
import { hydrateSerializedEvent } from "@/lib/events/hydrate-event-detail";
import { useCourtAssignmentsRealtime } from "@/lib/hooks/use-court-assignments-realtime";
import { useEventDetailAccessSync } from "@/lib/hooks/use-event-detail-access-sync";
import { useEventDetailQueueDerived } from "@/lib/hooks/use-event-detail-queue-derived";
import { useEventDetailQueueHandlers } from "@/lib/hooks/use-event-detail-queue-handlers";
import { useEventQueueLink } from "@/lib/hooks/use-event-queue-link";
import { useQueuePositionNotify } from "@/lib/hooks/use-queue-position-notify";
import { useRealtimeQueue } from "@/lib/hooks/use-realtime-queue";
import { useNotifications } from "@/lib/use-notifications";

import type {
  EventDetailAccess,
  EventDetailSerializedAssignment,
  EventDetailSerializedEvent,
} from "@/lib/events/event-detail-server";

export function EventDetailClient({
  eventId,
  initialEvent,
  initialAssignments,
  initialAccess,
  initialIsAdmin,
}: {
  eventId: string;
  initialEvent: EventDetailSerializedEvent;
  initialAssignments: EventDetailSerializedAssignment[];
  initialAccess: EventDetailAccess;
  initialIsAdmin: boolean;
}) {
  const event = useMemo(
    () => hydrateSerializedEvent(initialEvent),
    [initialEvent],
  );

  const assignments = useCourtAssignmentsRealtime(eventId, initialAssignments);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [showQrDialog, setShowQrDialog] = useState(false);

  const { user } = useAuth();
  const {
    queue,
    loading: queueLoading,
    refetch: refetchQueue,
  } = useRealtimeQueue(eventId);
  const { sendNotification } = useNotifications();

  const {
    canJoin,
    joinReason,
    requiresPayment,
    paymentAmount,
    isAdmin,
  } = useEventDetailAccessSync(user, eventId, initialAccess, initialIsAdmin);

  const queueLink = useEventQueueLink(eventId);

  const {
    userPosition,
    isPendingSolo,
    isPendingStay,
    isUpNext,
    isCurrentlyPlaying,
    waitingCount,
    playingCount,
  } = useEventDetailQueueDerived(queue, user, assignments, event);

  useQueuePositionNotify(
    userPosition,
    sendNotification,
    isPendingSolo,
    isPendingStay,
  );

  const { handleEndGame, handleJoinQueue, handleQueueRemove } =
    useEventDetailQueueHandlers({
      eventId,
      event,
      user,
      queue,
      assignments,
      isAdmin,
      waitingCount,
      refetchQueue,
      sendNotification,
      setShowJoinDialog,
    });

  return (
    <div className="min-h-screen bg-background">
      <Header backButton={{ href: "/events", label: "Back to Events" }} />

      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-8">
          <EventDetailHero event={event} />

          <div className="mb-4">
            <NotificationPrompt />
          </div>

          {userPosition > 0 ? (
            <div className="mb-6">
              <QueuePositionAlert
                position={userPosition}
                isUpNext={isUpNext}
                isPendingStay={isPendingStay}
                isPendingSolo={isPendingSolo}
              />
            </div>
          ) : null}

          <EventDetailStatsRow
            event={event}
            waitingCount={waitingCount}
            playingCount={playingCount}
          />
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
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
              currentUserId={user?.id}
              isAdmin={isAdmin}
              onCompleteGame={handleEndGame}
            />
          </div>

          <div>
            <EventQueueHeaderRow
              isCurrentlyPlaying={isCurrentlyPlaying}
              userPosition={userPosition}
              isPendingStay={isPendingStay}
              isPendingSolo={isPendingSolo}
              canJoin={canJoin}
              joinReason={joinReason}
              requiresPayment={requiresPayment}
              paymentAmount={paymentAmount}
              user={user}
              isAdmin={isAdmin}
              onJoinClick={() => setShowJoinDialog(true)}
              onShowQrClick={() => setShowQrDialog(true)}
            />
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
                onRemove={handleQueueRemove}
                currentUserId={user?.id || ""}
                isAdmin={isAdmin}
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
        rotationType={event.rotationType}
      />

      <EventDetailQrDialog
        open={showQrDialog}
        onOpenChange={setShowQrDialog}
        queueLink={queueLink}
      />
    </div>
  );
}
