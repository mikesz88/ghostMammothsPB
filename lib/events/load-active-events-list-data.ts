import "server-only";

import { serializeEvent } from "@/lib/events/event-detail-serialize";
import { eventRowToEvent } from "@/lib/events/event-row-to-domain";
import { createClient } from "@/lib/supabase/server";

import type { EventDetailSerializedEvent } from "@/lib/events/event-detail-server";

/**
 * Active events for the public list (same query shape as `useRealtimeEvents` initial fetch).
 */
export async function loadActiveEventsListData(): Promise<
  EventDetailSerializedEvent[]
> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("status", "active")
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching events (server):", error);
    return [];
  }

  return (data ?? []).map((row) => serializeEvent(eventRowToEvent(row)));
}
