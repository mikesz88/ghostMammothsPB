"use client";


import { EmailStatsFailedSendsHeader } from "@/components/admin/email-stats/email-stats-failed-sends-header";
import { EmailStatsFailedSendsTable } from "@/components/admin/email-stats/email-stats-failed-sends-table";
import { Card, CardContent } from "@/components/ui/card";
import { useEmailStatsResend } from "@/lib/hooks/use-email-stats-resend";

import type { EmailStatsSuccess } from "@/lib/admin/email-stats-types";

export function EmailStatsFailedSendsCard({ stats }: { stats: EmailStatsSuccess }) {
  const { resendingId, handleResend } = useEmailStatsResend();
  const failed = stats.failedDeliveryLogs ?? [];
  return (
    <Card className="border-border bg-card mb-8">
      <EmailStatsFailedSendsHeader />
      <CardContent>
        {failed.length === 0 ? (
          <p className="text-center text-muted-foreground py-6">
            No delivery failures in this range
          </p>
        ) : (
          <EmailStatsFailedSendsTable
            failed={failed}
            resendingId={resendingId}
            onResend={handleResend}
          />
        )}
      </CardContent>
    </Card>
  );
}
