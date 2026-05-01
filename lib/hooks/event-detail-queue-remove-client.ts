import { dispatchQueueEntryRemoval } from "@/lib/hooks/event-detail-queue-remove-flow";
import { collectQueueLeaveTargetIds } from "@/lib/hooks/queue-leave-target-ids";

import type { SendNotification } from "@/lib/hooks/event-detail-queue-handlers-types";
import type { QueueEntry } from "@/lib/types";

export type QueueRemoveFlowCommon = {
  entryId: string;
  isSelf: boolean;
  isAdmin: boolean;
  eventName: string;
  refetchQueue: () => Promise<void>;
  sendNotification: SendNotification;
};

export type RunClientQueueRemoveFlowParams = QueueRemoveFlowCommon & {
  entry: QueueEntry;
  queue: QueueEntry[];
  adminRemovingOther: boolean;
  beginOptimisticQueueLeave: (
    entry: QueueEntry,
    snapshotQueue: QueueEntry[],
  ) => void;
  clearOptimisticQueueLeave: () => void;
  setLeavingTargets: (ids: string[]) => void;
};

function toCommon(p: RunClientQueueRemoveFlowParams): QueueRemoveFlowCommon {
  const { entryId, isSelf, isAdmin, eventName, refetchQueue, sendNotification } =
    p;
  return { entryId, isSelf, isAdmin, eventName, refetchQueue, sendNotification };
}

async function removeAdminOtherFlow(
  common: QueueRemoveFlowCommon,
  setLeavingTargets: (ids: string[]) => void,
): Promise<void> {
  try {
    const result = await dispatchQueueEntryRemoval(common);
    if (!result.ok && !result.cancelled) {
      await common.refetchQueue();
    }
  } finally {
    setLeavingTargets([]);
  }
}

async function removeWithOptimisticFlow(p: RunClientQueueRemoveFlowParams) {
  const common = toCommon(p);
  p.beginOptimisticQueueLeave(p.entry, p.queue);
  try {
    const result = await dispatchQueueEntryRemoval(common);
    if (!result.ok) {
      await common.refetchQueue();
    }
  } finally {
    p.clearOptimisticQueueLeave();
    p.setLeavingTargets([]);
  }
}

export async function runClientQueueRemoveFlow(
  p: RunClientQueueRemoveFlowParams,
): Promise<void> {
  p.setLeavingTargets(collectQueueLeaveTargetIds(p.entry, p.queue));
  if (p.adminRemovingOther) {
    await removeAdminOtherFlow(toCommon(p), p.setLeavingTargets);
    return;
  }
  await removeWithOptimisticFlow(p);
}
