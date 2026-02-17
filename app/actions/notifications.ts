"use server";

import { createClient } from "@/lib/supabase/server";
import {
  sendQueueJoinEmail,
  sendPositionUpdateEmail,
  sendUpNextEmail,
  sendCourtAssignmentEmail,
  type QueueEmailData,
} from "@/lib/email/resend";
import { format, parse } from "date-fns";

export async function sendQueueNotification(
  userId: string,
  eventId: string,
  position: number,
  notificationType: "join" | "position-update" | "up-next" | "court-assignment",
  courtNumber?: number
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

  let formattedTime = "";
  if (event.time) {
    try {
      // Parse the time string (HH:MM:SS format) and format as 12-hour with AM/PM
      const timeParsed = parse(event.time, "HH:mm:ss", new Date());
      formattedTime = ` at ${format(timeParsed, "h:mm a")}`;
    } catch {
      // Fallback to original time if parsing fails
      formattedTime = ` at ${event.time}`;
    }
  }

  const emailData: QueueEmailData = {
    userName: user.name || "Player",
    userEmail: user.email,
    eventName: event.name,
    eventLocation: event.location,
    eventDate: format(new Date(event.date), "PPP") + formattedTime,
    currentPosition: position,
    estimatedWaitTime: calculateEstimatedWait(
      position,
      event.court_count || 1,
      event.team_size || 2
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

  await supabase.from("email_logs").insert({
    user_id: userId,
    event_id: eventId,
    notification_type: notificationType,
    sent_at: new Date().toISOString(),
    success: result.success,
    error_message: result.success ? null : String(result.error),
  });

  return result;
}

function calculateEstimatedWait(
  position: number,
  courtCount: number,
  teamSize: number
): number {
  const playersPerRound = courtCount * teamSize * 2;
  const roundsToWait = Math.ceil(position / playersPerRound);
  const avgGameMinutes = 15;
  return roundsToWait * avgGameMinutes;
}

export async function getEmailStats(
  timeRange: "today" | "week" | "month" | "all" = "week"
) {
  const supabase = await createClient();

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
    .select("*")
    .gte("sent_at", dateFilter.toISOString())
    .order("sent_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }

  const total = logs?.length || 0;
  const successful = logs?.filter((log) => log.success).length || 0;
  const failed = total - successful;

  const byType =
    logs?.reduce((acc: Record<string, number>, log) => {
      acc[log.notification_type] = (acc[log.notification_type] || 0) + 1;
      return acc;
    }, {}) || {};

  return {
    total,
    successful,
    failed,
    byType,
    logs: logs || [],
  };
}
