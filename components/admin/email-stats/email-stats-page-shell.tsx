"use client";

import { EmailStatsPageBody } from "@/components/admin/email-stats/email-stats-page-body";
import { Header } from "@/components/ui/header";

import type {
  EmailStatsSuccess,
  EmailStatsTimeRange,
} from "@/lib/admin/email-stats-types";

export function EmailStatsPageShell({
  stats,
  timeRange,
  loadError,
}: {
  stats: EmailStatsSuccess;
  timeRange: EmailStatsTimeRange;
  loadError: string | null;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Header
        variant="admin"
        backButton={{ href: "/admin", label: "Back to Dashboard" }}
      />
      <EmailStatsPageBody
        stats={stats}
        timeRange={timeRange}
        loadError={loadError}
      />
    </div>
  );
}
