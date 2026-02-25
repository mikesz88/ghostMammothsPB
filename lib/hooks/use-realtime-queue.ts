"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { QueueEntry } from "../types";

export function useRealtimeQueue(eventId: string) {
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchRef = useRef<() => Promise<void>>(() => Promise.resolve());

  useEffect(() => {
    const supabase = createClient();

    const fetchQueue = async () => {
      const { data, error } = await supabase
        .from("queue_entries")
        .select(
          `
          *,
          user:users(*)
        `
        )
        .eq("event_id", eventId)
        .eq("status", "waiting")
        .order("position");

      if (error) {
        console.error("Error fetching queue:", error);
      } else {
        const queueWithDates = (data || []).map((entry: any) => ({
          ...entry,
          eventId: entry.event_id,
          userId: entry.user_id,
          groupId: entry.group_id,
          groupSize: entry.group_size,
          joinedAt: new Date(entry.joined_at),
        }));
        setQueue(queueWithDates);
      }
      setLoading(false);
    };

    fetchRef.current = fetchQueue;
    queueMicrotask(() => fetchQueue());

    const channel = supabase
      .channel(`queue:${eventId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "queue_entries",
          filter: `event_id=eq.${eventId}`,
        },
        () => fetchQueue()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  const refetch = () => fetchRef.current?.();

  return { queue, loading, refetch };
}
