"use server";

import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
import { inspect } from "node:util";

import { isActionableDeliveryFailure } from "@/lib/email/email-delivery-log";
import {
  sendQueueJoinEmail,
  sendPositionUpdateEmail,
  sendUpNextEmail,
  sendCourtAssignmentEmail,
  type QueueEmailData,
} from "@/lib/email/resend";
import { runWithConcurrency } from "@/lib/run-with-concurrency";
import { createClient } from "@/lib/supabase/server";

const CENTRAL_TZ = "America/Chicago";
const QUEUE_EMAIL_CONCURRENCY = 3;

export type NotificationType =
  | "join"
  | "position-update"
  | "up-next"
  | "court-assignment";

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
      /** Rows where Resend/transport failed after retries — excludes missing email / invalid data. */
      failed: number;
      /** Failed logs that are validation/data issues, not delivery attempts. */
      failedOther: number;
      byType: Record<string, number>;
      logs: EmailLogRow[];
      failedDeliveryLogs: EmailLogRow[];
    };

/** Serialize Resend / fetch errors without producing `[object Object]` (circular refs, odd SDK shapes). */
function formatSendError(error: unknown): string {
  if (error == null) return "Unknown error";
  if (error instanceof Error) {
    return error.message || error.name || "Error";
  }
  if (typeof error === "string") return error;
  if (typeof error === "number" || typeof error === "boolean") {
    return String(error);
  }
  if (typeof error === "object") {
    const o = error as Record<string, unknown>;

    if (typeof o.message === "string" && o.message.length > 0) {
      return o.message;
    }
    if (o.message != null) {
      return formatSendError(o.message);
    }

    if (typeof o.error === "string" && o.error.length > 0) {
      return o.error;
    }
    if (o.error != null) {
      return formatSendError(o.error);
    }

    const name = typeof o.name === "string" ? o.name : "";
    const status =
      typeof o.statusCode === "number"
        ? o.statusCode
        : typeof o.status === "number"
          ? o.status
          : null;
    const prefix = [name, status != null ? `HTTP ${status}` : ""]
      .filter(Boolean)
      .join(" ");

    try {
      const s = JSON.stringify(error);
      if (s !== "{}" && s !== "null") {
        return prefix ? `${prefix}: ${s}` : s;
      }
    } catch {
      /* circular or non-serializable */
    }

    const detail = inspect(error, { depth: 6, breakLength: 200 });
    return prefix ? `${prefix} ${detail}` : detail;
  }
  return String(error);
}

/** Replace useless legacy DB values from older `String(error)` on plain objects. */
function normalizeStoredErrorMessage(stored: string | null): string | null {
  if (stored == null) return null;
  const t = stored.trim();
  if (
    t === "[object Object]" ||
    t === "Error: [object Object]" ||
    t.endsWith("[object Object]")
  ) {
    return "Legacy log: error details were not saved. New sends record readable errors; match this row to Resend by time and recipient, or use Resend.";
  }
  return stored;
}

async function requireAdmin(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<{ error: string | null }> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return { error: "Unauthorized" };
  }
  return { error: null };
}

export async function sendQueueNotification(
  userId: string,
  eventId: string,
  position: number,
  notificationType: NotificationType,
  courtNumber?: number,
) {
  const supabase = await createClient();

  const { data: user } = await supabase
    .from("users")
    .select("email, name")
    .eq("id", userId)
    .single();

  if (!user?.email) {
    console.log("No email found for user:", userId);
    return { success: false, error: "User email not found" };
  }

  const { data: event } = await supabase
    .from("events")
    .select("name, location, date, time, court_count, team_size")
    .eq("id", eventId)
    .single();

  if (!event) {
    console.log("Event not found:", eventId);
    return { success: false, error: "Event not found" };
  }

  // Build event moment: treat stored date + time as Central, then format in Central for email
  const timeStr = (event.time || "00:00:00").slice(0, 8);
  const [y, m, d] = event.date.split("-").map(Number);
  const [hr, min, sec] = timeStr
    .split(":")
    .map((n: string) => parseInt(n, 10) || 0);
  const localParts = new Date(Date.UTC(y, m - 1, d, hr, min, sec));
  const eventMoment = fromZonedTime(localParts, CENTRAL_TZ);
  const eventDate =
    formatInTimeZone(eventMoment, CENTRAL_TZ, "PPP") +
    (event.time
      ? " at " + formatInTimeZone(eventMoment, CENTRAL_TZ, "h:mm a")
      : "");

  const emailData: QueueEmailData = {
    userName: user.name || "Player",
    userEmail: user.email,
    eventName: event.name,
    eventLocation: event.location,
    eventDate,
    currentPosition: position,
    estimatedWaitTime: calculateEstimatedWait(
      position,
      event.court_count || 1,
      event.team_size || 2,
    ),
    courtNumber,
  };

  let result;
  switch (notificationType) {
    case "join":
      result = await sendQueueJoinEmail(emailData);
      break;
    case "position-update":
      result = await sendPositionUpdateEmail(emailData);
      break;
    case "up-next":
      result = await sendUpNextEmail(emailData);
      break;
    case "court-assignment":
      result = await sendCourtAssignmentEmail(emailData);
      break;
    default:
      return { success: false, error: "Invalid notification type" };
  }

  const messageId =
    result.success && "messageId" in result ? result.messageId : undefined;

  await supabase.from("email_logs").insert({
    user_id: userId,
    event_id: eventId,
    notification_type: notificationType,
    sent_at: new Date().toISOString(),
    success: result.success,
    error_message: result.success ? null : formatSendError(result.error),
    resend_message_id: messageId ?? null,
  });

  return result;
}

/** Await from server actions so serverless runtimes finish sends; limits parallel Resend calls. */
export async function flushQueueEmailNotifications(
  items: Array<{
    userId: string;
    eventId: string;
    position: number;
    notificationType: NotificationType;
    courtNumber?: number;
  }>,
): Promise<void> {
  if (items.length === 0) return;
  await runWithConcurrency(
    items.map(
      (item) => () =>
        sendQueueNotification(
          item.userId,
          item.eventId,
          item.position,
          item.notificationType,
          item.courtNumber,
        ),
    ),
    QUEUE_EMAIL_CONCURRENCY,
  );
}

function calculateEstimatedWait(
  position: number,
  courtCount: number,
  teamSize: number,
): number {
  const playersPerRound = courtCount * teamSize * 2;
  const roundsToWait = Math.ceil(position / playersPerRound);
  const avgGameMinutes = 15;
  return roundsToWait * avgGameMinutes;
}

export async function getEmailStats(
  timeRange: "today" | "week" | "month" | "all" = "week",
): Promise<GetEmailStatsResult> {
  const supabase = await createClient();

  const { error: authError } = await requireAdmin(supabase);
  if (authError) return { error: authError };

  let dateFilter = new Date();
  switch (timeRange) {
    case "today":
      dateFilter.setHours(0, 0, 0, 0);
      break;
    case "week":
      dateFilter.setDate(dateFilter.getDate() - 7);
      break;
    case "month":
      dateFilter.setMonth(dateFilter.getMonth() - 1);
      break;
    case "all":
      dateFilter = new Date(0); // Beginning of time
      break;
  }

  const { data: logs, error } = await supabase
    .from("email_logs")
    .select(
      `
      id,
      user_id,
      event_id,
      notification_type,
      sent_at,
      success,
      error_message,
      resend_message_id,
      user:users!email_logs_user_id_fkey ( id, name, email ),
      event:events!email_logs_event_id_fkey ( id, name )
    `,
    )
    .gte("sent_at", dateFilter.toISOString())
    .order("sent_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }

  const normalizedLogs: EmailLogRow[] = (logs || []).map((row) => {
    const r = row as {
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
      event: { id: string; name: string } | { id: string; name: string }[] | null;
    };
    const u = r.user;
    const e = r.event;
    return {
      id: r.id,
      user_id: r.user_id,
      event_id: r.event_id,
      notification_type: r.notification_type,
      sent_at: r.sent_at,
      success: r.success,
      error_message: normalizeStoredErrorMessage(r.error_message),
      resend_message_id: r.resend_message_id ?? null,
      user: Array.isArray(u) ? u[0] ?? null : u ?? null,
      event: Array.isArray(e) ? e[0] ?? null : e ?? null,
    };
  });

  const total = normalizedLogs.length;
  const successful = normalizedLogs.filter((log) => log.success).length;
  const failedDeliveryLogs = normalizedLogs.filter(isActionableDeliveryFailure);
  const failed = failedDeliveryLogs.length;
  const failedOther = normalizedLogs.filter((log) => !log.success).length - failed;

  const byType =
    normalizedLogs.reduce((acc: Record<string, number>, log) => {
      acc[log.notification_type] = (acc[log.notification_type] || 0) + 1;
      return acc;
    }, {}) || {};

  return {
    total,
    successful,
    failed,
    failedOther,
    byType,
    logs: normalizedLogs,
    failedDeliveryLogs,
  };
}

async function findActiveCourtNumber(
  supabase: Awaited<ReturnType<typeof createClient>>,
  eventId: string,
  userId: string,
): Promise<number | null> {
  const orClause = [1, 2, 3, 4, 5, 6, 7, 8]
    .map((n) => `player${n}_id.eq.${userId}`)
    .join(",");

  const { data, error } = await supabase
    .from("court_assignments")
    .select("court_number")
    .eq("event_id", eventId)
    .is("ended_at", null)
    .or(orClause)
    .maybeSingle();

  if (error || data == null) return null;
  return data.court_number;
}

export async function resendQueueEmailFromLog(logId: string) {
  const supabase = await createClient();

  const { error: authError } = await requireAdmin(supabase);
  if (authError) return { success: false, error: authError };

  const { data: log, error: fetchError } = await supabase
    .from("email_logs")
    .select("id, success, user_id, event_id, notification_type")
    .eq("id", logId)
    .single();

  if (fetchError || !log) {
    return { success: false, error: "Log entry not found" };
  }

  if (log.success) {
    return { success: false, error: "This send already succeeded" };
  }

  if (!log.user_id || !log.event_id) {
    return {
      success: false,
      error: "Log entry is missing user or event; cannot resend",
    };
  }

  const userId = log.user_id;
  const eventId = log.event_id;
  const notificationType = log.notification_type as NotificationType;

  const validTypes: NotificationType[] = [
    "join",
    "position-update",
    "up-next",
    "court-assignment",
  ];
  if (!validTypes.includes(notificationType)) {
    return { success: false, error: "Unknown notification type" };
  }

  if (notificationType === "court-assignment") {
    const { data: entry } = await supabase
      .from("queue_entries")
      .select("status")
      .eq("event_id", eventId)
      .eq("user_id", userId)
      .maybeSingle();

    if (entry?.status !== "playing") {
      return {
        success: false,
        error:
          "Player is not on a court (status must be playing) to resend court assignment",
      };
    }

    const courtNumber = await findActiveCourtNumber(
      supabase,
      eventId,
      userId,
    );
    if (courtNumber == null) {
      return {
        success: false,
        error: "No active court assignment found for this player",
      };
    }

    const { data: qe } = await supabase
      .from("queue_entries")
      .select("position")
      .eq("event_id", eventId)
      .eq("user_id", userId)
      .single();

    const position = qe?.position ?? 1;
    return sendQueueNotification(
      userId,
      eventId,
      position,
      "court-assignment",
      courtNumber,
    );
  }

  const { data: waiting } = await supabase
    .from("queue_entries")
    .select("position")
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .in("status", ["waiting", "pending_solo"])
    .maybeSingle();

  if (!waiting) {
    return {
      success: false,
      error:
        "Player is not in the waiting queue; resend is only available with current queue state",
    };
  }

  return sendQueueNotification(
    userId,
    eventId,
    waiting.position,
    notificationType,
  );
}
