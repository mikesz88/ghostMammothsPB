import { XCircle } from "lucide-react";

import { EmailStatsMetricCard } from "@/components/admin/email-stats/email-stats-metric-card";
import { EmailStatsOverviewFailedNote } from "@/components/admin/email-stats/email-stats-overview-failed-note";

import type { EmailStatsSuccess } from "@/lib/admin/email-stats-types";

export function EmailStatsOverviewDeliveryCard({ stats }: { stats: EmailStatsSuccess }) {
  return (
    <EmailStatsMetricCard
      label="Failed (delivery)"
      value={stats.failed}
      valueClassName="text-red-600"
      icon={XCircle}
      iconWrapClassName="bg-red-100 text-red-600"
      footer={<EmailStatsOverviewFailedNote count={stats.failedOther ?? 0} />}
    />
  );
}
