"use client";

import { EmailStatsBreakdownCard } from "@/components/admin/email-stats/email-stats-breakdown-card";
import { EmailStatsFailedSendsCard } from "@/components/admin/email-stats/email-stats-failed-sends-card";
import { EmailStatsLoadErrorAlert } from "@/components/admin/email-stats/email-stats-load-error-alert";
import { EmailStatsOverviewCards } from "@/components/admin/email-stats/email-stats-overview-cards";
import { EmailStatsPageHeading } from "@/components/admin/email-stats/email-stats-page-heading";
import { EmailStatsRangeButtons } from "@/components/admin/email-stats/email-stats-range-buttons";
import { EmailStatsSmsEstimateCard } from "@/components/admin/email-stats/email-stats-sms-estimate-card";

import type {
  EmailStatsSuccess,
  EmailStatsTimeRange,
} from "@/lib/admin/email-stats-types";

export function EmailStatsPageBody({
  stats,
  timeRange,
  loadError,
}: {
  stats: EmailStatsSuccess;
  timeRange: EmailStatsTimeRange;
  loadError: string | null;
}) {
  return (
    <div className="container mx-auto px-4 py-12">
      <EmailStatsPageHeading />
      {loadError ? <EmailStatsLoadErrorAlert message={loadError} /> : null}
      <EmailStatsRangeButtons timeRange={timeRange} />
      <EmailStatsOverviewCards stats={stats} />
      <EmailStatsBreakdownCard stats={stats} />
      <EmailStatsFailedSendsCard stats={stats} />
      <EmailStatsSmsEstimateCard stats={stats} timeRange={timeRange} />
    </div>
  );
}
