import "server-only";

import { createClient } from "@/lib/supabase/server";

export async function fetchActiveEventsWithCounts() {
  const supabase = await createClient();
  const { data: events, error } = await supabase
    .from("events")
    .select(
      `
      *,
      queue_entries!inner(count),
      court_assignments!inner(count)
    `,
    )
    .eq("status", "active")
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching events:", error);
    return { events: [], error };
  }

  return { events: events || [], error: null };
}

export async function fetchEventRowById(id: string) {
  const supabase = await createClient();
  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching event:", error);
    return { event: null, error };
  }

  return { event, error: null };
}
