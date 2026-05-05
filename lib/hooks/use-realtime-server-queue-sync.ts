"use client";

import { useEffect, useRef, type MutableRefObject } from "react";

import { subscribeRealtimeQueueEntries } from "@/lib/hooks/realtime-queue-channel";
import { fetchRealtimeQueueRows } from "@/lib/hooks/realtime-queue-fetch";
import { scheduleRealtimeQueuePoll } from "@/lib/hooks/realtime-server-queue-poll";
import { queuePollIntervalMs } from "@/lib/realtime/queue-poll-interval";
import { createClient } from "@/lib/supabase/client";

import type { QueueEntry } from "@/lib/types";

function attachQueueRealtime(
  eventId: string,
  setServerQueueRef: MutableRefObject<(rows: QueueEntry[]) => void>,
  setLoadingRef: MutableRefObject<(loading: boolean) => void>,
  fetchRef: MutableRefObject<() => Promise<void>>,
) {
  const supabase = createClient();
  const fetchQueue = async () => {
    const rows = await fetchRealtimeQueueRows(supabase, eventId);
    setServerQueueRef.current(rows);
    setLoadingRef.current(false);
  };
  fetchRef.current = fetchQueue;
  queueMicrotask(() => fetchQueue());
  const channel = subscribeRealtimeQueueEntries(supabase, eventId, fetchQueue);
  const stopPoll = scheduleRealtimeQueuePoll(queuePollIntervalMs(), fetchQueue);
  return () => {
    stopPoll?.();
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribes to `queue_entries` for `eventId` and refetches on postgres_changes.
 * Effect deps are only `eventId` (matches pre–a7e3d80 behavior) so the channel is not
 * torn down on unrelated re-renders; setState refs always point at the latest dispatchers.
 */
export function useRealtimeServerQueueSync(
  eventId: string,
  setServerQueue: (rows: QueueEntry[]) => void,
  setLoading: (loading: boolean) => void,
) {
  const fetchRef = useRef<() => Promise<void>>(() => Promise.resolve());
  const setServerQueueRef = useRef(setServerQueue);
  const setLoadingRef = useRef(setLoading);

  useEffect(() => {
    setServerQueueRef.current = setServerQueue;
    setLoadingRef.current = setLoading;
  }, [setServerQueue, setLoading]);

  useEffect(() => {
    return attachQueueRealtime(eventId, setServerQueueRef, setLoadingRef, fetchRef);
  }, [eventId]);

  return fetchRef;
}
