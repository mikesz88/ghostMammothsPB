"use client";

import {
  formatEmailStatsLogTime,
  truncateEmailStatsError,
} from "@/components/admin/email-stats/email-stats-display-utils";
import { EmailStatsFailedTypeCell } from "@/components/admin/email-stats/email-stats-failed-type-cell";
import { EmailStatsResendButton } from "@/components/admin/email-stats/email-stats-resend-button";
import { FailedSendEventCell } from "@/components/admin/email-stats/failed-send-event-cell";
import { FailedSendPlayerCell } from "@/components/admin/email-stats/failed-send-player-cell";

import type { EmailLogRow } from "@/lib/admin/email-stats-types";

function FailedSendTimeCell({ sentAt }: { sentAt: string }) {
  return (
    <td className="p-3 whitespace-nowrap text-muted-foreground">
      {formatEmailStatsLogTime(sentAt)}
    </td>
  );
}

function FailedSendErrorCell({ message }: { message: string | null }) {
  return (
    <td
      className="p-3 text-muted-foreground max-w-[280px]"
      title={message ?? undefined}
    >
      {truncateEmailStatsError(message)}
    </td>
  );
}

export function EmailStatsFailedSendRow({
  log,
  resendingId,
  onResend,
}: {
  log: EmailLogRow;
  resendingId: string | null;
  onResend: (log: EmailLogRow) => void;
}) {
  return (
    <tr className="border-b border-border last:border-0">
      <FailedSendTimeCell sentAt={log.sent_at} />
      <EmailStatsFailedTypeCell type={log.notification_type} />
      <FailedSendPlayerCell log={log} />
      <FailedSendEventCell log={log} />
      <FailedSendErrorCell message={log.error_message} />
      <td className="p-3">
        <EmailStatsResendButton
          busy={resendingId === log.id}
          onClick={() => onResend(log)}
        />
      </td>
    </tr>
  );
}
