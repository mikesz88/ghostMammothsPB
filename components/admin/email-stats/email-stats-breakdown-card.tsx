import { EmailStatsBreakdownRow } from "@/components/admin/email-stats/email-stats-breakdown-row";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";


import type { EmailStatsSuccess } from "@/lib/admin/email-stats-types";

export function EmailStatsBreakdownCard({ stats }: { stats: EmailStatsSuccess }) {
  const entries = Object.entries(stats.byType || {});
  return (
    <Card className="border-border bg-card mb-8">
      <CardHeader>
        <CardTitle>Email Breakdown by Type</CardTitle>
        <CardDescription>
          Understand which notifications are sent most
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {entries.map(([type, count]) => (
            <EmailStatsBreakdownRow key={type} type={type} count={count} />
          ))}
          {entries.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No emails sent yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
