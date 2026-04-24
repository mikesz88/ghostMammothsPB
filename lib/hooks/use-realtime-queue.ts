"use client";

import { useEffect, useRef, useState } from "react";

import { subscribeRealtimeQueueEntries } from "@/lib/hooks/realtime-queue-channel";
import { fetchRealtimeQueueRows } from "@/lib/hooks/realtime-queue-fetch";
import { createClient } from "@/lib/supabase/client";

import type { QueueEntry } from "@/lib/types";

export function useRealtimeQueue(eventId: string) {
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchRef = useRef<() => Promise<void>>(() => Promise.resolve());

  useEffect(() => {
    const supabase = createClient();
    const fetchQueue = async () => {
      const rows = await fetchRealtimeQueueRows(supabase, eventId);
      setQueue(rows);
      setLoading(false);
    };
    fetchRef.current = fetchQueue;
    queueMicrotask(() => fetchQueue());
    const channel = subscribeRealtimeQueueEntries(
      supabase,
      eventId,
      fetchQueue,
    );
    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  const refetch = () => fetchRef.current?.();

  return { queue, loading, refetch };
}
