"use server";

import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

import {
  sendQueueJoinEmail,
  sendPositionUpdateEmail,
  sendUpNextEmail,
  sendCourtAssignmentEmail,
  type QueueEmailData,
} from "@/lib/email/resend";
import { formatSendError } from "@/lib/notifications/format-send-error";
import { runWithConcurrency } from "@/lib/run-with-concurrency";
import { createClient } from "@/lib/supabase/server";

const CENTRAL_TZ = "America/Chicago";
const QUEUE_EMAIL_CONCURRENCY = 3;

export type NotificationType =
  | "join"
  | "position-update"
  | "up-next"
  | "court-assignment";

export type SendQueueNotificationParams = {
  userId: string;
  eventId: string;
  position: number;
  notificationType: NotificationType;
  courtNumber?: number;
};

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

function buildFormattedEventDate(event: {
  date: string;
  time: string | null;
}): string {
  const timeStr = (event.time || "00:00:00").slice(0, 8);
  const [y, m, d] = event.date.split("-").map(Number);
  const [hr, min, sec] = timeStr
    .split(":")
    .map((n: string) => parseInt(n, 10) || 0);
  const localParts = new Date(Date.UTC(y, m - 1, d, hr, min, sec));
  const eventMoment = fromZonedTime(localParts, CENTRAL_TZ);
  return (
    formatInTimeZone(eventMoment, CENTRAL_TZ, "PPP") +
    (event.time
      ? " at " + formatInTimeZone(eventMoment, CENTRAL_TZ, "h:mm a")
      : "")
  );
}

async function routeQueueEmail(
  notificationType: NotificationType,
  emailData: QueueEmailData,
) {
  switch (notificationType) {
    case "join":
      return sendQueueJoinEmail(emailData);
    case "position-update":
      return sendPositionUpdateEmail(emailData);
    case "up-next":
      return sendUpNextEmail(emailData);
    case "court-assignment":
      return sendCourtAssignmentEmail(emailData);
  }
}

type SendPrep = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
  eventId: string;
  position: number;
  courtNumber?: number;
};

async function loadQueueEmailTargets(p: SendPrep) {
  const [{ data: user }, { data: event }] = await Promise.all([
    p.supabase.from("users").select("email, name").eq("id", p.userId).single(),
    p.supabase
      .from("events")
      .select("name, location, date, time, court_count, team_size")
      .eq("id", p.eventId)
      .single(),
  ]);
  return { user, event };
}

type QueueEmailEventRow = Parameters<typeof buildFormattedEventDate>[0] & {
  name: string;
  location: string | null;
  court_count: number | null;
  team_size: number | null;
};

function buildQueueEmailData(
  user: { email: string; name: string | null },
  event: QueueEmailEventRow,
  position: number,
  courtNumber?: number,
): QueueEmailData {
  return {
    userName: user.name || "Player",
    userEmail: user.email,
    eventName: event.name,
    eventLocation: event.location ?? "",
    eventDate: buildFormattedEventDate(event),
    currentPosition: position,
    estimatedWaitTime: calculateEstimatedWait(
      position,
      event.court_count || 1,
      event.team_size || 2,
    ),
    courtNumber,
  };
}

async function requireQueueEmailRecords(p: SendPrep) {
  const { user, event } = await loadQueueEmailTargets(p);
  if (!user?.email) {
    console.warn("No email found for user:", p.userId);
    return { ok: false as const, error: { success: false as const, error: "User email not found" } };
  }
  if (!event) {
    console.warn("Event not found:", p.eventId);
    return { ok: false as const, error: { success: false as const, error: "Event not found" } };
  }
  return { ok: true as const, user, event };
}

type LogQueueEmailAttemptParams = {
  supabase: SendPrep["supabase"];
  userId: string;
  eventId: string;
  notificationType: NotificationType;
  result: Awaited<ReturnType<typeof routeQueueEmail>>;
};

async function logQueueEmailAttempt(p: LogQueueEmailAttemptParams) {
  const messageId =
    p.result.success && "messageId" in p.result ? p.result.messageId : undefined;
  await p.supabase.from("email_logs").insert({
    user_id: p.userId,
    event_id: p.eventId,
    notification_type: p.notificationType,
    sent_at: new Date().toISOString(),
    success: p.result.success,
    error_message: p.result.success ? null : formatSendError(p.result.error),
    resend_message_id: messageId ?? null,
  });
}

export async function sendQueueNotification(params: SendQueueNotificationParams) {
  const { userId, eventId, position, notificationType, courtNumber } = params;
  const supabase = await createClient();
  const records = await requireQueueEmailRecords({
    supabase,
    userId,
    eventId,
    position,
    courtNumber,
  });
  if (!records.ok) return records.error;

  const emailData = buildQueueEmailData(records.user, records.event, position, courtNumber);
  const result = await routeQueueEmail(notificationType, emailData);
  await logQueueEmailAttempt({
    supabase,
    userId,
    eventId,
    notificationType,
    result,
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
        sendQueueNotification({
          userId: item.userId,
          eventId: item.eventId,
          position: item.position,
          notificationType: item.notificationType,
          courtNumber: item.courtNumber,
        }),
    ),
    QUEUE_EMAIL_CONCURRENCY,
  );
}
