import { reconcilePendingSoloForEvent } from "@/lib/queue/pending-solo";
import {
  buildCourtAssignmentInsert,
  expandNextPlayersToPlayerSlots,
} from "@/lib/queue/services/court-assignment-helpers";
import { reorderQueue } from "@/lib/queue/services/queue-ordering";

import type { CourtAssignmentReadyCtx } from "@/lib/queue/services/court-assignment-types";
import type { CourtAssignmentInsert, DbClient } from "@/lib/queue/types";

type QueueNotification = {
  userId: string;
  eventId: string;
  position: number;
  notificationType: "up-next" | "position-update" | "court-assignment";
  courtNumber?: number;
};

type FlushQueueNotifications = (notifications: QueueNotification[]) => Promise<void>;

async function insertCourtAssignmentRecord(
  ctx: CourtAssignmentReadyCtx,
  eventId: string,
  playerSlots: ReturnType<typeof expandNextPlayersToPlayerSlots>,
) {
  const assignmentData = buildCourtAssignmentInsert(
    eventId,
    ctx.availableCourt,
    ctx.nextPlayers,
    playerSlots,
  );
  return supabaseInsertAssignment(ctx.supabase, assignmentData);
}

async function supabaseInsertAssignment(
  supabase: CourtAssignmentReadyCtx["supabase"],
  assignmentData: CourtAssignmentInsert,
) {
  const { error: assignmentError } = await supabase
    .from("court_assignments")
    .insert(assignmentData);
  if (!assignmentError) return { success: true as const };
  console.error("Error creating assignment:", assignmentError);
  return {
    success: false as const,
    error: `Failed to assign players: ${assignmentError.message}`,
  };
}

async function clearPendingStayersAfterStay(args: {
  supabase: CourtAssignmentReadyCtx["supabase"];
  eventId: string;
  availableCourt: number;
  pendingRow: CourtAssignmentReadyCtx["pendingRow"];
  stayingMapped: CourtAssignmentReadyCtx["stayingMapped"];
}) {
  if (args.pendingRow && args.stayingMapped.length > 0) {
    await args.supabase
      .from("court_pending_stayers")
      .delete()
      .eq("event_id", args.eventId)
      .eq("court_number", args.availableCourt);
  }
}

async function insertAssignmentAndClearPendingStayers(
  ctx: CourtAssignmentReadyCtx,
  eventId: string,
) {
  const playerSlots = expandNextPlayersToPlayerSlots(ctx.nextPlayers);
  const inserted = await insertCourtAssignmentRecord(ctx, eventId, playerSlots);
  if (!inserted.success) return inserted;
  await clearPendingStayersAfterStay({
    supabase: ctx.supabase,
    eventId,
    availableCourt: ctx.availableCourt,
    pendingRow: ctx.pendingRow,
    stayingMapped: ctx.stayingMapped,
  });
  return { success: true as const };
}

async function markPlayersPlaying(
  supabase: DbClient,
  nextPlayers: CourtAssignmentReadyCtx["nextPlayers"],
) {
  for (const player of nextPlayers) {
    const { error: updateError } = await supabase
      .from("queue_entries")
      .update({ status: "playing" })
      .eq("id", player.id);

    if (updateError) {
      console.error(`Failed to update player ${player.id}:`, updateError);
    }
  }
}

export async function commitCourtAssignment(
  eventId: string,
  flushQueueNotifications: FlushQueueNotifications,
  ctx: CourtAssignmentReadyCtx,
) {
  const insert = await insertAssignmentAndClearPendingStayers(ctx, eventId);
  if (!insert.success) return insert;

  await markPlayersPlaying(ctx.supabase, ctx.nextPlayers);

  await flushQueueNotifications(
    ctx.nextPlayers.map((player) => ({
      userId: player.userId,
      eventId,
      position: player.position,
      notificationType: "court-assignment" as const,
      courtNumber: ctx.availableCourt,
    })),
  ).catch((err) => console.error("Failed to send court assignment emails:", err));

  await reconcilePendingSoloForEvent(eventId);
  await reorderQueue(eventId, { flushQueueNotifications });

  return {
    success: true as const,
    courtNumber: ctx.availableCourt,
    playersAssigned: ctx.playersPerCourt,
  };
}
