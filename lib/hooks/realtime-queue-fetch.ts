import {
  mapRealtimeQueueEntry,
  type QueueEntryWithUser,
} from "@/lib/hooks/realtime-queue-map-entry";

import type { QueueEntry } from "@/lib/types";
import type { Database } from "@/supabase/supa-schema";
import type { SupabaseClient } from "@supabase/supabase-js";

const QUEUE_SELECT = `
          *,
          user:users(*)
        `;

export async function fetchRealtimeQueueRows(
  supabase: SupabaseClient<Database>,
  eventId: string,
): Promise<QueueEntry[]> {
  const { data, error } = await supabase
    .from("queue_entries")
    .select(QUEUE_SELECT)
    .eq("event_id", eventId)
    .in("status", ["waiting", "pending_solo", "pending_stay"])
    .order("position");

  if (error) {
    console.error("Error fetching queue:", error);
    return [];
  }
  return (data || []).map((entry: QueueEntryWithUser) =>
    mapRealtimeQueueEntry(entry),
  );
}
