import { EmailStatsMetricCardFlexRow } from "@/components/admin/email-stats/email-stats-metric-card-flex-row";
import { EmailStatsMetricCardIconWrap } from "@/components/admin/email-stats/email-stats-metric-card-icon-wrap";
import { EmailStatsMetricCardText } from "@/components/admin/email-stats/email-stats-metric-card-text";

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmailStatsMetricCardInner({
  label,
  value,
  valueClassName,
  icon,
  iconWrapClassName,
  footer,
}: {
  label: string;
  value: number;
  valueClassName?: string;
  icon: LucideIcon;
  iconWrapClassName: string;
  footer?: ReactNode;
}) {
  return (
    <EmailStatsMetricCardFlexRow
      left={
        <EmailStatsMetricCardText label={label} value={value} valueClassName={valueClassName} footer={footer} />
      }
      right={<EmailStatsMetricCardIconWrap icon={icon} className={iconWrapClassName} />}
    />
  );
}
