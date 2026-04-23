"use client";

import { useEventDetailClientHydration } from "@/lib/hooks/use-event-detail-client-hydration";
import { useEventDetailClientSession } from "@/lib/hooks/use-event-detail-client-session";
import { useEventDetailQueueDerived } from "@/lib/hooks/use-event-detail-queue-derived";
import { useEventDetailQueueHandlers } from "@/lib/hooks/use-event-detail-queue-handlers";
import { useQueuePositionNotify } from "@/lib/hooks/use-queue-position-notify";

import type {
  EventDetailAccess,
  EventDetailSerializedAssignment,
  EventDetailSerializedEvent,
} from "@/lib/events/event-detail-server";

type Props = {
  eventId: string;
  initialEvent: EventDetailSerializedEvent;
  initialAssignments: EventDetailSerializedAssignment[];
  initialAccess: EventDetailAccess;
  initialIsAdmin: boolean;
};

type Bootstrap = ReturnType<typeof useEventDetailClientBootstrap>;
type QueueDerived = ReturnType<typeof useEventDetailQueueDerived>;

function useEventDetailClientBootstrap(p: Props) {
  const { event, assignments } = useEventDetailClientHydration(
    p.eventId,
    p.initialEvent,
    p.initialAssignments,
  );
  const session = useEventDetailClientSession(
    p.eventId,
    p.initialAccess,
    p.initialIsAdmin,
  );
  return { eventId: p.eventId, event, assignments, ...session };
}

function useEventDetailClientDerivedAndNotify(b: Bootstrap) {
  const derived = useEventDetailQueueDerived(
    b.queue,
    b.user,
    b.assignments,
    b.event,
  );
  useQueuePositionNotify(
    derived.userPosition,
    b.sendNotification,
    derived.isPendingSolo,
    derived.isPendingStay,
  );
  return derived;
}

function useEventDetailClientQueueHandlersMerged(
  b: Bootstrap,
  derived: QueueDerived,
) {
  return useEventDetailQueueHandlers({
    eventId: b.eventId,
    event: b.event,
    user: b.user,
    queue: b.queue,
    assignments: b.assignments,
    isAdmin: b.isAdmin,
    waitingCount: derived.waitingCount,
    refetchQueue: b.refetchQueue,
    sendNotification: b.sendNotification,
    setShowJoinDialog: b.setShowJoinDialog,
  });
}

function useEventDetailClientActions(b: Bootstrap) {
  const derived = useEventDetailClientDerivedAndNotify(b);
  const handlers = useEventDetailClientQueueHandlersMerged(b, derived);
  return { ...derived, ...handlers };
}

export function useEventDetailClientView(p: Props) {
  const b = useEventDetailClientBootstrap(p);
  const actions = useEventDetailClientActions(b);
  return { ...b, ...actions };
}
