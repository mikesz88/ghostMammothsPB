"use server";

import { revalidatePath } from "next/cache";

import { reconcilePendingSoloForEvent } from "@/lib/queue/pending-solo";
import { assignPlayersToNextCourt as assignPlayersToNextCourtService } from "@/lib/queue/services/court-assignment";
import { endGameAndReorderQueue as endGameAndReorderQueueService } from "@/lib/queue/services/end-game";
import {
  adminRemoveFromQueueService,
  joinQueueService,
  leaveQueueService,
} from "@/lib/queue/services/queue-membership";
import { reorderQueue as reorderQueueService } from "@/lib/queue/services/queue-ordering";
import { createClient } from "@/lib/supabase/server";

import { flushQueueEmailNotifications } from "./notifications";

import type { DbClient } from "@/lib/queue/types";

export { reconcilePendingSoloForEvent };

const membershipDeps = {
  flushQueueNotifications: flushQueueEmailNotifications,
};

export async function getQueue(eventId: string) {
  const supabase = await createClient();

  const { data: queue, error } = await supabase
    .from("queue_entries")
    .select(
      `
      *,
      user:users(*)
    `,
    )
    .eq("event_id", eventId)
    .in("status", ["waiting", "pending_solo"])
    .order("position");

  if (error) {
    console.error("Error fetching queue:", error);
    return { queue: [], error };
  }

  return { queue: queue || [], error: null };
}

export async function joinQueue(
  eventId: string,
  userId: string,
  groupSize: number,
  groupId?: string,
  playerNames?: Array<{ name: string; skillLevel: string }>,
) {
  const result = await joinQueueService(
    eventId,
    userId,
    groupSize,
    groupId,
    playerNames,
    membershipDeps,
  );

  if ("data" in result) {
    revalidatePath(`/events/${eventId}`);
    return { data: result.data, error: null };
  }

  return { error: result.error };
}

export async function leaveQueue(queueEntryId: string) {
  const result = await leaveQueueService(queueEntryId, membershipDeps);

  if (result.error !== null) {
    return { error: result.error };
  }

  revalidatePath(`/events/${result.eventId}`);
  return { error: null };
}

export async function reorderQueue(eventId: string, db?: DbClient) {
  return reorderQueueService(eventId, {
    db,
    flushQueueNotifications: flushQueueEmailNotifications,
  });
}

export async function endGameAndReorderQueue(
  eventId: string,
  assignmentId: string,
  winningTeam: "team1" | "team2",
) {
  const result = await endGameAndReorderQueueService(
    eventId,
    assignmentId,
    winningTeam,
    flushQueueEmailNotifications,
  );
  if (!result.success) {
    return result;
  }
  revalidatePath(`/events/${eventId}`);
  revalidatePath(`/admin/events/${eventId}`);
  return result;
}

export async function assignPlayersToNextCourt(eventId: string) {
  const result = await assignPlayersToNextCourtService(
    eventId,
    flushQueueEmailNotifications,
  );
  if (!result.success) {
    return result;
  }
  revalidatePath(`/events/${eventId}`);
  revalidatePath(`/admin/events/${eventId}`);
  return result;
}

export async function adminRemoveFromQueue(queueEntryId: string) {
  const result = await adminRemoveFromQueueService(
    queueEntryId,
    membershipDeps,
  );

  if (result.error !== null) {
    return { error: result.error };
  }

  revalidatePath(`/events/${result.eventId}`);
  revalidatePath(`/admin/events/${result.eventId}`);

  return { error: null };
}
