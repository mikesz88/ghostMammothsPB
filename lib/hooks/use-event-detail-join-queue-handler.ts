"use client";

import { useCallback } from "react";

import { runJoinQueueHandler } from "@/lib/hooks/event-detail-join-queue-flow";

import type {
  EventDetailQueueHandlersParams,
  JoinPlayer,
} from "@/lib/hooks/event-detail-queue-handlers-types";

export function useEventDetailJoinQueueHandler(p: EventDetailQueueHandlersParams) {
  return useCallback(
    (players: JoinPlayer[], groupSize: number) =>
      runJoinQueueHandler(p, players, groupSize),
    [p],
  );
}
