import { runClientQueueRemoveFlow } from "@/lib/hooks/event-detail-queue-remove-client";

import type { SendNotification } from "@/lib/hooks/event-detail-queue-handlers-types";
import type { QueueEntry } from "@/lib/types";

export type QueueRemoveHandlerParams = {
  eventName: string;
  userId: string | undefined;
  queue: QueueEntry[];
  isAdmin: boolean;
  refetchQueue: () => Promise<void>;
  sendNotification: SendNotification;
  beginOptimisticQueueLeave: (
    entry: QueueEntry,
    snapshotQueue: QueueEntry[],
  ) => void;
  clearOptimisticQueueLeave: () => void;
};

export async function invokeQueueRemove(
  entryId: string,
  p: QueueRemoveHandlerParams,
  setLeavingTargets: (ids: string[]) => void,
): Promise<void> {
  const entry = p.queue.find((e) => e.id === entryId);
  if (!entry) return;
  await runClientQueueRemoveFlow({
    entryId,
    entry,
    queue: p.queue,
    isSelf: entry.userId === p.userId,
    isAdmin: p.isAdmin,
    adminRemovingOther: p.isAdmin && entry.userId !== p.userId,
    eventName: p.eventName,
    refetchQueue: p.refetchQueue,
    sendNotification: p.sendNotification,
    beginOptimisticQueueLeave: p.beginOptimisticQueueLeave,
    clearOptimisticQueueLeave: p.clearOptimisticQueueLeave,
    setLeavingTargets,
  });
}
