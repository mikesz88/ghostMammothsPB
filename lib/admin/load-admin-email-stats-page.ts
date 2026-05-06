import { fetchEmailStats } from "@/lib/admin/fetch-email-stats";
import { requireAdminSession } from "@/lib/admin/require-admin-session";

import type { EmailStatsTimeRange } from "@/lib/admin/email-stats-types";

export async function loadAdminEmailStatsPageData(
  timeRange: EmailStatsTimeRange,
) {
  const supabase = await requireAdminSession();
  return fetchEmailStats(supabase, timeRange);
}
