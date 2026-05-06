"use client";

import { useState } from "react";

import { invokeQueueRemove } from "@/lib/hooks/event-detail/event-detail-queue-remove-invoke";

import type { QueueRemoveHandlerParams } from "@/lib/hooks/event-detail/event-detail-queue-remove-invoke";

export function useEventDetailQueueRemoveHandler(p: QueueRemoveHandlerParams) {
  const [leavingQueueEntryIds, setLeavingQueueEntryIds] = useState<string[]>(
    [],
  );
  function handleQueueRemove(entryId: string) {
    void invokeQueueRemove(entryId, p, setLeavingQueueEntryIds);
  }
  return { handleQueueRemove, leavingQueueEntryIds };
}
