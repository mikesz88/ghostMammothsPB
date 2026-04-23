import { CheckCircle, Mail } from "lucide-react";

import { EmailStatsMetricCard } from "@/components/admin/email-stats/email-stats-metric-card";
import { EmailStatsOverviewDeliveryCard } from "@/components/admin/email-stats/email-stats-overview-delivery-card";

import type { EmailStatsSuccess } from "@/lib/admin/email-stats-types";

export function EmailStatsOverviewCards({ stats }: { stats: EmailStatsSuccess }) {
  return (
    <div className="grid md:grid-cols-3 gap-6 mb-12">
      <EmailStatsMetricCard
        label="Total Emails"
        value={stats.total}
        icon={Mail}
        iconWrapClassName="bg-primary/10 text-primary"
      />
      <EmailStatsMetricCard
        label="Successful"
        value={stats.successful}
        valueClassName="text-green-600"
        icon={CheckCircle}
        iconWrapClassName="bg-green-100 text-green-600"
      />
      <EmailStatsOverviewDeliveryCard stats={stats} />
    </div>
  );
}
