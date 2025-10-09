"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { QueueEntry } from "../types";

export function useRealtimeQueue(eventId: string) {
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    // Initial fetch
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
        setQueue(data || []);
      }
      setLoading(false);
    };

    fetchQueue();

    // Subscribe to real-time changes
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
        () => {
          // Refetch on any change
          fetchQueue();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, supabase]);

  return { queue, loading };
}
