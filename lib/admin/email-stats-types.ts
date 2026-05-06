export type EmailStatsTimeRange = "today" | "week" | "month" | "all";

export type EmailLogRow = {
  id: string;
  user_id: string | null;
  event_id: string | null;
  notification_type: string;
  sent_at: string;
  success: boolean;
  error_message: string | null;
  resend_message_id: string | null;
  user: { id: string; name: string; email: string } | null;
  event: { id: string; name: string } | null;
};

export type GetEmailStatsResult =
  | { error: string }
  | {
      total: number;
      successful: number;
      failed: number;
      failedOther: number;
      byType: Record<string, number>;
      logs: EmailLogRow[];
      failedDeliveryLogs: EmailLogRow[];
    };

export type EmailStatsSuccess = Extract<GetEmailStatsResult, { total: number }>;
