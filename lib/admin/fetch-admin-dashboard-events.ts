import type { Database } from "@/supabase/supa-schema";
import type { SupabaseClient } from "@supabase/supabase-js";

export function fetchAdminDashboardEvents(
  supabase: SupabaseClient<Database>,
) {
  return supabase.from("events").select("*").order("date", { ascending: true });
}
