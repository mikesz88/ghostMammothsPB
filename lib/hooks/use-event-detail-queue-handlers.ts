"use client";

import { useEventDetailEndGameHandler } from "@/lib/hooks/use-event-detail-end-game-handler";
import { useEventDetailJoinQueueHandler } from "@/lib/hooks/use-event-detail-join-queue-handler";
import { useEventDetailQueueRemoveHandler } from "@/lib/hooks/use-event-detail-queue-remove-handler";

import type { EventDetailQueueHandlersParams } from "@/lib/hooks/event-detail-queue-handlers-types";

export type {
  EventDetailQueueHandlersParams,
  JoinPlayer,
} from "@/lib/hooks/event-detail-queue-handlers-types";

export function useEventDetailQueueHandlers(p: EventDetailQueueHandlersParams) {
  return {
    handleEndGame: useEventDetailEndGameHandler(p.eventId, p.event.rotationType),
    handleJoinQueue: useEventDetailJoinQueueHandler(p),
    handleQueueRemove: useEventDetailQueueRemoveHandler({
      eventName: p.event.name,
      userId: p.user?.id,
      queue: p.queue,
      isAdmin: p.isAdmin,
      refetchQueue: p.refetchQueue,
      sendNotification: p.sendNotification,
    }),
  };
}
