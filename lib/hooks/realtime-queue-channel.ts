import type { Database } from "@/supabase/supa-schema";
import type { SupabaseClient } from "@supabase/supabase-js";

export function subscribeRealtimeQueueEntries(
  supabase: SupabaseClient<Database>,
  eventId: string,
  onChange: () => void,
) {
  return supabase
    .channel(`queue:${eventId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "queue_entries",
        filter: `event_id=eq.${eventId}`,
      },
      () => onChange(),
    )
    .subscribe();
}
