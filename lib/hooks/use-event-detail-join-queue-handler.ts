"use client";

import { useCallback, useState } from "react";

import { runJoinQueueHandler } from "@/lib/hooks/event-detail-join-queue-flow";

import type {
  EventDetailQueueHandlersParams,
  JoinPlayer,
} from "@/lib/hooks/event-detail-queue-handlers-types";

export function useEventDetailJoinQueueHandler(p: EventDetailQueueHandlersParams) {
  const [isJoiningQueue, setIsJoiningQueue] = useState(false);

  const handleJoinQueue = useCallback(
    async (players: JoinPlayer[], groupSize: number) => {
      setIsJoiningQueue(true);
      try {
        await runJoinQueueHandler(p, players, groupSize);
      } finally {
        setIsJoiningQueue(false);
      }
    },
    [p],
  );

  return { handleJoinQueue, isJoiningQueue };
}
