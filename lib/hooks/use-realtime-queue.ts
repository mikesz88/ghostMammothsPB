"use client";

import { useState } from "react";

import { useRealtimeQueueOptimisticFilter } from "@/lib/hooks/use-realtime-queue-optimistic";
import { useRealtimeServerQueueSync } from "@/lib/hooks/use-realtime-server-queue-sync";

import type { QueueEntry } from "@/lib/types";

export function useRealtimeQueue(eventId: string) {
  const [serverQueue, setServerQueue] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchRef = useRealtimeServerQueueSync(
    eventId,
    setServerQueue,
    setLoading,
  );
  const {
    queue,
    beginOptimisticQueueLeave,
    clearOptimisticQueueLeave,
  } = useRealtimeQueueOptimisticFilter(serverQueue);
  const refetch = () => fetchRef.current?.();

  return {
    queue,
    loading,
    refetch,
    beginOptimisticQueueLeave,
    clearOptimisticQueueLeave,
  };
}
