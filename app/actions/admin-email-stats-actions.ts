"use server";

import { fetchEmailStats } from "@/lib/admin/fetch-email-stats";
import { createClient } from "@/lib/supabase/server";

import {
  sendQueueNotification,
  type NotificationType,
} from "./queue-email-notifications";

import type {
  EmailStatsTimeRange,
  GetEmailStatsResult,
} from "@/lib/admin/email-stats-types";

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

export async function getEmailStats(
  timeRange: EmailStatsTimeRange = "week",
): Promise<GetEmailStatsResult> {
  const supabase = await createClient();
  const { error: authError } = await requireAdmin(supabase);
  if (authError) return { error: authError };
  return fetchEmailStats(supabase, timeRange);
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

const RESEND_VALID_TYPES: NotificationType[] = [
  "join",
  "position-update",
  "up-next",
  "court-assignment",
];

function validateResendLogBase(log: {
  success: boolean;
  user_id: string | null;
  event_id: string | null;
  notification_type: string;
}):
  | {
      ok: true;
      userId: string;
      eventId: string;
      notificationType: NotificationType;
    }
  | { ok: false; error: string } {
  if (log.success) return { ok: false, error: "This send already succeeded" };
  if (!log.user_id || !log.event_id) {
    return { ok: false, error: "Log entry is missing user or event; cannot resend" };
  }
  const notificationType = log.notification_type as NotificationType;
  if (!RESEND_VALID_TYPES.includes(notificationType)) {
    return { ok: false, error: "Unknown notification type" };
  }
  return { ok: true, userId: log.user_id, eventId: log.event_id, notificationType };
}

async function assertPlayingForCourtResend(
  supabase: Awaited<ReturnType<typeof createClient>>,
  eventId: string,
  userId: string,
) {
  const { data: entry } = await supabase
    .from("queue_entries")
    .select("status")
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .maybeSingle();
  if (entry?.status !== "playing") {
    return {
      success: false as const,
      error:
        "Player is not on a court (status must be playing) to resend court assignment",
    };
  }
  return { success: true as const };
}

async function resendCourtAssignmentFromLog(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  eventId: string,
) {
  const playing = await assertPlayingForCourtResend(supabase, eventId, userId);
  if (!playing.success) return playing;
  const courtNumber = await findActiveCourtNumber(supabase, eventId, userId);
  if (courtNumber == null) {
    return { success: false, error: "No active court assignment found for this player" };
  }
  const { data: qe } = await supabase
    .from("queue_entries")
    .select("position")
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .single();
  return sendQueueNotification({
    userId,
    eventId,
    position: qe?.position ?? 1,
    notificationType: "court-assignment",
    courtNumber,
  });
}

async function resendWaitingNotificationFromLog(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  eventId: string,
  notificationType: NotificationType,
) {
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
  return sendQueueNotification({ userId, eventId, position: waiting.position, notificationType });
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
  if (fetchError || !log) return { success: false, error: "Log entry not found" };

  const validated = validateResendLogBase(log);
  if (!validated.ok) return { success: false, error: validated.error };

  const { userId, eventId, notificationType } = validated;
  if (notificationType === "court-assignment") {
    return resendCourtAssignmentFromLog(supabase, userId, eventId);
  }

  return resendWaitingNotificationFromLog(
    supabase,
    userId,
    eventId,
    notificationType,
  );
}
