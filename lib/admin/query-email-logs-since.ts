import "server-only";

import { startDateForEmailStatsRange } from "@/lib/admin/start-date-for-email-stats-range";

import type { EmailStatsTimeRange } from "@/lib/admin/email-stats-types";
import type { Database } from "@/supabase/supa-schema";
import type { SupabaseClient } from "@supabase/supabase-js";

const EMAIL_LOG_SELECT = `
      id,
      user_id,
      event_id,
      notification_type,
      sent_at,
      success,
      error_message,
      resend_message_id,
      user:users!email_logs_user_id_fkey ( id, name, email ),
      event:events!email_logs_event_id_fkey ( id, name )
    `;

export async function queryEmailLogsSince(
  supabase: SupabaseClient<Database>,
  timeRange: EmailStatsTimeRange,
) {
  const dateFilter = startDateForEmailStatsRange(timeRange);
  return supabase
    .from("email_logs")
    .select(EMAIL_LOG_SELECT)
    .gte("sent_at", dateFilter.toISOString())
    .order("sent_at", { ascending: false });
}
