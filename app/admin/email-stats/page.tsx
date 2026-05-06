import { EmailStatsPageClient } from "@/components/admin/email-stats/email-stats-page-client";
import { EMPTY_EMAIL_STATS_SUCCESS } from "@/lib/admin/email-stats-empty-stats";
import { parseEmailStatsTimeRange } from "@/lib/admin/email-stats-time-range";
import { loadAdminEmailStatsPageData } from "@/lib/admin/load-admin-email-stats-page";

export default async function EmailStatsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range } = await searchParams;
  const timeRange = parseEmailStatsTimeRange(range);
  const result = await loadAdminEmailStatsPageData(timeRange);
  const loadError = "error" in result ? result.error : null;
  const stats = "error" in result ? EMPTY_EMAIL_STATS_SUCCESS : result;

  return (
    <EmailStatsPageClient
      stats={stats}
      timeRange={timeRange}
      loadError={loadError}
    />
  );
}
