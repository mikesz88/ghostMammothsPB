import { isActionableDeliveryFailure } from "@/lib/email/email-delivery-log";

import type { EmailLogRow, GetEmailStatsResult } from "@/lib/admin/email-stats-types";

export function aggregateEmailStatsFromLogs(
  logs: EmailLogRow[],
): Extract<GetEmailStatsResult, { total: number }> {
  const total = logs.length;
  const successful = logs.filter((log) => log.success).length;
  const failedDeliveryLogs = logs.filter(isActionableDeliveryFailure);
  const failed = failedDeliveryLogs.length;
  const failedOther = logs.filter((log) => !log.success).length - failed;
  const byType = logs.reduce((acc: Record<string, number>, log) => {
    acc[log.notification_type] = (acc[log.notification_type] || 0) + 1;
    return acc;
  }, {});
  return {
    total,
    successful,
    failed,
    failedOther,
    byType,
    logs,
    failedDeliveryLogs,
  };
}
