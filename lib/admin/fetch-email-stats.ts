import "server-only";

import { aggregateEmailStatsFromLogs } from "@/lib/admin/aggregate-email-stats-from-logs";
import { mapRawRowsToEmailLogs } from "@/lib/admin/map-raw-rows-to-email-logs";
import { queryEmailLogsSince } from "@/lib/admin/query-email-logs-since";

import type {
  EmailStatsTimeRange,
  GetEmailStatsResult,
} from "@/lib/admin/email-stats-types";
import type { Database } from "@/supabase/supa-schema";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function fetchEmailStats(
  supabase: SupabaseClient<Database>,
  timeRange: EmailStatsTimeRange,
): Promise<GetEmailStatsResult> {
  const { data: logs, error } = await queryEmailLogsSince(supabase, timeRange);
  if (error) return { error: error.message };
  const normalized = mapRawRowsToEmailLogs(logs || []);
  return aggregateEmailStatsFromLogs(normalized);
}
