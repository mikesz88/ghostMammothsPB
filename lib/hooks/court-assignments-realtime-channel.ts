import type { Database } from "@/supabase/supa-schema";
import type { SupabaseClient } from "@supabase/supabase-js";

export function subscribeCourtAssignmentsChanges(
  supabase: SupabaseClient<Database>,
  eventId: string,
  onChange: () => void,
) {
  return supabase
    .channel(`public-assignments-${eventId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "court_assignments",
        filter: `event_id=eq.${eventId}`,
      },
      () => onChange(),
    )
    .subscribe();
}
