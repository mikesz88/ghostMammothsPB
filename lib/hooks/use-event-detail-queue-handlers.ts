"use client";

import { useEventDetailEndGameHandler } from "@/lib/hooks/use-event-detail-end-game-handler";
import { useEventDetailJoinQueueHandler } from "@/lib/hooks/use-event-detail-join-queue-handler";
import { useEventDetailQueueRemoveHandler } from "@/lib/hooks/use-event-detail-queue-remove-handler";

import type { EventDetailQueueHandlersParams } from "@/lib/hooks/event-detail-queue-handlers-types";

export type {
  EventDetailQueueHandlersParams,
  JoinPlayer,
} from "@/lib/hooks/event-detail-queue-handlers-types";

export function useEventDetailQueueHandlers({
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
}: EventDetailQueueHandlersParams) {
  const handleEndGame = useEventDetailEndGameHandler(
    eventId,
    event.rotationType,
  );
  const handleJoinQueue = useEventDetailJoinQueueHandler({
    eventId,
    eventName: event.name,
    user,
    queue,
    assignments,
    waitingCount,
    refetchQueue,
    sendNotification,
    setShowJoinDialog,
  });
  const handleQueueRemove = useEventDetailQueueRemoveHandler({
    eventName: event.name,
    userId: user?.id,
    queue,
    isAdmin,
    refetchQueue,
    sendNotification,
  });

  return {
    handleEndGame,
    handleJoinQueue,
    handleQueueRemove,
  };
}
