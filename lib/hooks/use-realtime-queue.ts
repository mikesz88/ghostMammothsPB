"use client";

import { useEffect, useRef, useState } from "react";

import { createClient } from "@/lib/supabase/client";

import type {
  GroupSize,
  QueueEntry,
  QueueStatus,
  SkillLevel,
} from "../types";
import type { Database } from "@/supabase/supa-schema";


type QueueEntryRow = Database["public"]["Tables"]["queue_entries"]["Row"];
type UserRow = Database["public"]["Tables"]["users"]["Row"];
type QueueEntryWithUser = QueueEntryRow & { user: UserRow | null };

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
        .in("status", ["waiting", "pending_solo", "pending_stay"])
        .order("position");

      if (error) {
        console.error("Error fetching queue:", error);
      } else {
        const queueWithDates: QueueEntry[] = (data || []).map(
          (entry: QueueEntryWithUser) => ({
            id: entry.id,
            eventId: entry.event_id,
            userId: entry.user_id,
            groupId: entry.group_id ?? undefined,
            groupSize: entry.group_size as GroupSize,
            position: entry.position,
            status: entry.status as QueueStatus,
            joinedAt: new Date(entry.joined_at),
            user: entry.user
              ? {
                  id: entry.user.id,
                  email: entry.user.email,
                  name: entry.user.name,
                  phone: entry.user.phone || undefined,
                  skillLevel: entry.user.skill_level as SkillLevel,
                  isAdmin: entry.user.is_admin,
                  createdAt: new Date(entry.user.created_at),
                }
              : undefined,
          }),
        );
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
