import { EmailStatsMetricCardInner } from "@/components/admin/email-stats/email-stats-metric-card-inner";
import { EmailStatsMetricCardShell } from "@/components/admin/email-stats/email-stats-metric-card-shell";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmailStatsMetricCard(props: {
  label: string;
  value: number;
  valueClassName?: string;
  icon: LucideIcon;
  iconWrapClassName: string;
  footer?: ReactNode;
}) {
  return (
    <EmailStatsMetricCardShell>
      <EmailStatsMetricCardInner {...props} />
    </EmailStatsMetricCardShell>
  );
}
