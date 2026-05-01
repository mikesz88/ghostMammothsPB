"use client";

import { useEffect, useRef, type MutableRefObject } from "react";

import { subscribeRealtimeQueueEntries } from "@/lib/hooks/realtime-queue-channel";
import { fetchRealtimeQueueRows } from "@/lib/hooks/realtime-queue-fetch";
import { createClient } from "@/lib/supabase/client";

import type { QueueEntry } from "@/lib/types";

function attachQueueRealtime(
  eventId: string,
  setServerQueue: (rows: QueueEntry[]) => void,
  setLoading: (loading: boolean) => void,
  fetchRef: MutableRefObject<() => Promise<void>>,
) {
  const supabase = createClient();
  const fetchQueue = async () => {
    const rows = await fetchRealtimeQueueRows(supabase, eventId);
    setServerQueue(rows);
    setLoading(false);
  };
  fetchRef.current = fetchQueue;
  queueMicrotask(() => fetchQueue());
  const channel = subscribeRealtimeQueueEntries(supabase, eventId, fetchQueue);
  return () => {
    supabase.removeChannel(channel);
  };
}

export function useRealtimeServerQueueSync(
  eventId: string,
  setServerQueue: (rows: QueueEntry[]) => void,
  setLoading: (loading: boolean) => void,
) {
  const fetchRef = useRef<() => Promise<void>>(() => Promise.resolve());
  useEffect(() => {
    return attachQueueRealtime(eventId, setServerQueue, setLoading, fetchRef);
  }, [eventId, setServerQueue, setLoading]);
  return fetchRef;
}
