"use server";

import {
  getEmailStats as getEmailStatsImpl,
  resendQueueEmailFromLog as resendQueueEmailFromLogImpl,
} from "./admin-email-stats-actions";
import {
  flushQueueEmailNotifications as flushQueueEmailNotificationsImpl,
  sendQueueNotification as sendQueueNotificationImpl,
} from "./queue-email-notifications";

import type { EmailStatsTimeRange } from "@/lib/admin/email-stats-types";

export type { EmailLogRow, GetEmailStatsResult } from "@/lib/admin/email-stats-types";
export type { NotificationType, SendQueueNotificationParams } from "./queue-email-notifications";

export async function sendQueueNotification(
  ...args: Parameters<typeof sendQueueNotificationImpl>
) {
  return sendQueueNotificationImpl(...args);
}

export async function flushQueueEmailNotifications(
  ...args: Parameters<typeof flushQueueEmailNotificationsImpl>
) {
  return flushQueueEmailNotificationsImpl(...args);
}

export async function getEmailStats(timeRange: EmailStatsTimeRange = "week") {
  return getEmailStatsImpl(timeRange);
}

export async function resendQueueEmailFromLog(logId: string) {
  return resendQueueEmailFromLogImpl(logId);
}
