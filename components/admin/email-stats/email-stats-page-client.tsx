"use client";

import { EmailStatsPageShell } from "@/components/admin/email-stats/email-stats-page-shell";

import type {
  EmailStatsSuccess,
  EmailStatsTimeRange,
} from "@/lib/admin/email-stats-types";

export function EmailStatsPageClient({
  stats,
  timeRange,
  loadError,
}: {
  stats: EmailStatsSuccess;
  timeRange: EmailStatsTimeRange;
  loadError: string | null;
}) {
  return (
    <EmailStatsPageShell
      stats={stats}
      timeRange={timeRange}
      loadError={loadError}
    />
  );
}
