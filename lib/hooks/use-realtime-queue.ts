"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { QueueEntry } from "../types";

export function useRealtimeQueue(eventId: string) {
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Define fetchQueue outside useEffect so it can be returned
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
      // Convert date strings to Date objects and map snake_case to camelCase
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

  useEffect(() => {
    // Initial fetch
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
        (payload) => {
          console.log("Queue change detected:", payload);
          // Refetch on any change
          fetchQueue();
        }
      )
      .subscribe((status) => {
        console.log("Queue subscription status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, supabase]);

  return { queue, loading, refetch: fetchQueue };
}
