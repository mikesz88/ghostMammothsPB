"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { QueueEntry, GroupSize, QueueStatus, SkillLevel } from "../types";
import type { Database } from "@/supabase/supa-schema";

type QueueEntryRow = Database["public"]["Tables"]["queue_entries"]["Row"];

type QueueEntryWithUser = QueueEntryRow & { 
  user: {
    id: string;
    name: string;
    email: string;
    skill_level: string;
  } | null;
};

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
      const queueWithDates = (data || []).map((entry: QueueEntryWithUser) => {
        // Parse player_names JSON if it exists
        let playerNamesArray: Array<{ name: string; skillLevel: string }> = [];
        if (entry.player_names) {
          try {
            const parsed = entry.player_names as unknown as Array<{ name: string; skillLevel: string }>;
            playerNamesArray = Array.isArray(parsed) ? parsed : [];
          } catch {
            playerNamesArray = [];
          }
        }
        
        return {
          id: entry.id,
          eventId: entry.event_id,
          userId: entry.user_id,
          groupId: entry.group_id || undefined,
          groupSize: (entry.group_size || 1) as GroupSize,
          player_names: playerNamesArray,
          position: entry.position,
          status: entry.status as QueueStatus,
          joinedAt: new Date(entry.joined_at),
          user: entry.user
            ? {
                id: entry.user.id,
                name: entry.user.name,
                email: entry.user.email,
                skillLevel: entry.user.skill_level as SkillLevel,
                isAdmin: false,
                createdAt: new Date(),
              }
            : undefined,
        };
      });
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
        (_payload) => {
          // Refetch on any change
          fetchQueue();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, supabase]);

  return { queue, loading, refetch: fetchQueue };
}
