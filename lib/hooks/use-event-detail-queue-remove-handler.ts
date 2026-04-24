"use client";

import { useCallback } from "react";

import { dispatchQueueEntryRemoval } from "@/lib/hooks/event-detail-queue-remove-flow";

import type { SendNotification } from "@/lib/hooks/event-detail-queue-handlers-types";
import type { QueueEntry } from "@/lib/types";

type Params = {
  eventName: string;
  userId: string | undefined;
  queue: QueueEntry[];
  isAdmin: boolean;
  refetchQueue: () => Promise<void>;
  sendNotification: SendNotification;
};

export function useEventDetailQueueRemoveHandler({
  eventName,
  userId,
  queue,
  isAdmin,
  refetchQueue,
  sendNotification,
}: Params) {
  return useCallback(
    async (entryId: string) => {
      const entry = queue.find((e) => e.id === entryId);
      if (!entry) return;
      const isSelf = entry.userId === userId;
      await dispatchQueueEntryRemoval({
        entryId,
        isSelf,
        isAdmin,
        eventName,
        refetchQueue,
        sendNotification,
      });
    },
    [queue, userId, isAdmin, refetchQueue, sendNotification, eventName],
  );
}
