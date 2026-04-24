"use client";

import { EmailStatsFailedRows } from "@/components/admin/email-stats/email-stats-failed-rows";
import { EmailStatsFailedTableHead } from "@/components/admin/email-stats/email-stats-failed-table-head";

import type { EmailLogRow } from "@/lib/admin/email-stats-types";

export function EmailStatsFailedSendsTable({
  failed,
  resendingId,
  onResend,
}: {
  failed: EmailLogRow[];
  resendingId: string | null;
  onResend: (log: EmailLogRow) => void;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <EmailStatsFailedTableHead />
        <tbody>
          <EmailStatsFailedRows
            failed={failed}
            resendingId={resendingId}
            onResend={onResend}
          />
        </tbody>
      </table>
    </div>
  );
}
