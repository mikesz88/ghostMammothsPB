"use client";

import { useEventDetailEndGameHandler } from "@/lib/hooks/event-detail/use-event-detail-end-game-handler";
import { useEventDetailJoinQueueHandler } from "@/lib/hooks/event-detail/use-event-detail-join-queue-handler";
import { useEventDetailQueueRemoveHandler } from "@/lib/hooks/event-detail/use-event-detail-queue-remove-handler";

import type { EventDetailQueueHandlersParams } from "@/lib/hooks/event-detail/event-detail-queue-handlers-types";

export type {
  EventDetailQueueHandlersParams,
  JoinPlayer,
} from "@/lib/hooks/event-detail/event-detail-queue-handlers-types";

export function useEventDetailQueueHandlers(p: EventDetailQueueHandlersParams) {
  const join = useEventDetailJoinQueueHandler(p);
  const remove = useEventDetailQueueRemoveHandler({
    eventName: p.event.name,
    userId: p.user?.id,
    queue: p.queue,
    isAdmin: p.isAdmin,
    refetchQueue: p.refetchQueue,
    sendNotification: p.sendNotification,
    beginOptimisticQueueLeave: p.beginOptimisticQueueLeave,
    clearOptimisticQueueLeave: p.clearOptimisticQueueLeave,
  });
  return {
    handleEndGame: useEventDetailEndGameHandler(p.eventId, p.event.rotationType),
    handleJoinQueue: join.handleJoinQueue,
    isJoiningQueue: join.isJoiningQueue,
    handleQueueRemove: remove.handleQueueRemove,
    leavingQueueEntryIds: remove.leavingQueueEntryIds,
  };
}
