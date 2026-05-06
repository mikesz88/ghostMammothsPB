import type { Database } from "@/supabase/supa-schema";
import type { SupabaseClient } from "@supabase/supabase-js";

type EventRow = Database["public"]["Tables"]["events"]["Row"];

/** Single-event read used by member and admin event detail loaders (same query). */
export async function fetchEventRowById(
  supabase: SupabaseClient<Database>,
  eventId: string,
): Promise<EventRow | null> {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();
  if (error || !data) return null;
  return data;
}
