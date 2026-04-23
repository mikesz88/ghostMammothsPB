import { EmailStatsSmsMonthlyHints } from "@/components/admin/email-stats/email-stats-sms-monthly-hints";
import { EmailStatsSmsPriceGrid } from "@/components/admin/email-stats/email-stats-sms-price-grid";

import type { EmailStatsTimeRange } from "@/lib/admin/email-stats-types";

export function EmailStatsSmsEstimateBody({
  total,
  timeRange,
}: {
  total: number;
  timeRange: EmailStatsTimeRange;
}) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Typical SMS costs: $0.0075 - $0.02 per message (varies by provider)
      </p>
      <EmailStatsSmsPriceGrid total={total} />
      <EmailStatsSmsMonthlyHints total={total} timeRange={timeRange} />
    </div>
  );
}
