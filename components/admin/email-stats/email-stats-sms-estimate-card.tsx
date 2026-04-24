import { EmailStatsSmsEstimateBody } from "@/components/admin/email-stats/email-stats-sms-estimate-body";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";


import type { EmailStatsSuccess , EmailStatsTimeRange } from "@/lib/admin/email-stats-types";

export function EmailStatsSmsEstimateCard({
  stats,
  timeRange,
}: {
  stats: EmailStatsSuccess;
  timeRange: EmailStatsTimeRange;
}) {
  const total = stats.total || 0;
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle>SMS Cost Estimation</CardTitle>
        <CardDescription>
          Estimated monthly SMS costs based on current email volume
        </CardDescription>
      </CardHeader>
      <CardContent>
        <EmailStatsSmsEstimateBody total={total} timeRange={timeRange} />
      </CardContent>
    </Card>
  );
}
