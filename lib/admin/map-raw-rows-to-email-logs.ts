import { normalizeStoredEmailErrorMessage } from "@/lib/admin/normalize-stored-email-error-message";

import type { EmailLogRow } from "@/lib/admin/email-stats-types";

function singleOrNull<T>(v: T | T[] | null | undefined): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

type RawEmailLogRow = {
  id: string;
  user_id: string | null;
  event_id: string | null;
  notification_type: string;
  sent_at: string;
  success: boolean;
  error_message: string | null;
  resend_message_id?: string | null;
  user:
    | { id: string; name: string; email: string }
    | { id: string; name: string; email: string }[]
    | null;
  event:
    | { id: string; name: string }
    | { id: string; name: string }[]
    | null;
};

function mapRawEmailLogRow(r: RawEmailLogRow): EmailLogRow {
  return {
    id: r.id,
    user_id: r.user_id,
    event_id: r.event_id,
    notification_type: r.notification_type,
    sent_at: r.sent_at,
    success: r.success,
    error_message: normalizeStoredEmailErrorMessage(r.error_message),
    resend_message_id: r.resend_message_id ?? null,
    user: singleOrNull(r.user),
    event: singleOrNull(r.event),
  };
}

export function mapRawRowsToEmailLogs(
  rows: unknown[],
): EmailLogRow[] {
  return rows.map((row) => mapRawEmailLogRow(row as RawEmailLogRow));
}
