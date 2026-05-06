import { EmailStatsSmsTodayHint } from "@/components/admin/email-stats/email-stats-sms-today-hint";
import { EmailStatsSmsWeekHint } from "@/components/admin/email-stats/email-stats-sms-week-hint";

import type { EmailStatsTimeRange } from "@/lib/admin/email-stats-types";

export function EmailStatsSmsMonthlyHints({
  total,
  timeRange,
}: {
  total: number;
  timeRange: EmailStatsTimeRange;
}) {
  if (timeRange === "week" && total > 0) return <EmailStatsSmsWeekHint total={total} />;
  if (timeRange === "today" && total > 0) {
    return <EmailStatsSmsTodayHint total={total} />;
  }
  return null;
}
