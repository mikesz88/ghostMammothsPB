"use client";

import { useCallback, useMemo, useState } from "react";

import { collectQueueLeaveTargetIds } from "@/lib/hooks/queue-leave-target-ids";

import type { QueueEntry } from "@/lib/types";

function filterHiddenFromQueue(
  serverQueue: QueueEntry[],
  hiddenIds: string[],
): QueueEntry[] {
  if (hiddenIds.length === 0) return serverQueue;
  const hide = new Set(hiddenIds);
  return serverQueue.filter((e) => !hide.has(e.id));
}

export function useRealtimeQueueOptimisticFilter(serverQueue: QueueEntry[]) {
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const queue = useMemo(
    () => filterHiddenFromQueue(serverQueue, hiddenIds),
    [serverQueue, hiddenIds],
  );
  const beginOptimisticQueueLeave = useCallback(
    (entry: QueueEntry, snapshotQueue: QueueEntry[]) => {
      setHiddenIds(collectQueueLeaveTargetIds(entry, snapshotQueue));
    },
    [],
  );
  const clearOptimisticQueueLeave = useCallback(() => setHiddenIds([]), []);
  return { queue, beginOptimisticQueueLeave, clearOptimisticQueueLeave };
}
