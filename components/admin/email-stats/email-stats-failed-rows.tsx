"use client";

import { EmailStatsFailedSendRow } from "@/components/admin/email-stats/email-stats-failed-send-row";

import type { EmailLogRow } from "@/lib/admin/email-stats-types";

export function EmailStatsFailedRows({
  failed,
  resendingId,
  onResend,
}: {
  failed: EmailLogRow[];
  resendingId: string | null;
  onResend: (log: EmailLogRow) => void;
}) {
  return (
    <>
      {failed.map((log) => (
        <EmailStatsFailedSendRow
          key={log.id}
          log={log}
          resendingId={resendingId}
          onResend={onResend}
        />
      ))}
    </>
  );
}
