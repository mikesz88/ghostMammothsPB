import type { EmailStatsSuccess } from "@/lib/admin/email-stats-types";

export const EMPTY_EMAIL_STATS_SUCCESS: EmailStatsSuccess = {
  total: 0,
  successful: 0,
  failed: 0,
  failedOther: 0,
  byType: {},
  logs: [],
  failedDeliveryLogs: [],
};
