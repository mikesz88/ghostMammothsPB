import {
  isRotateAllStyleRotation,
  isWinnersStayStyleRotation,
} from "@/lib/rotation-policy";
import {
  getAllParticipantEntryIdsSlotOrder,
  getSideEntryIdsSlotOrder,
} from "@/lib/queue/assignment-helpers";
import { reconcilePendingSoloForEvent } from "@/lib/queue/pending-solo";
import { reorderQueue } from "@/lib/queue/services/queue-ordering";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { createClient } from "@/lib/supabase/server";

import type { GameEntryRow } from "@/lib/queue/types";
import type { RotationType, TeamSize } from "@/lib/types";

type QueueNotification = {
  userId: string;
  eventId: string;
  position: number;
  notificationType: "up-next" | "position-update" | "court-assignment";
  courtNumber?: number;
};

type FlushQueueNotifications = (notifications: QueueNotification[]) => Promise<void>;

export async function endGameAndReorderQueue(
  eventId: string,
  assignmentId: string,
  winningTeam: "team1" | "team2",
  flushQueueNotifications: FlushQueueNotifications,
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, error: "Not authenticated" };
  }
  const { data: profile } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  const { data: eventRow, error: eventErr } = await supabase
    .from("events")
    .select("team_size, rotation_type")
    .eq("id", eventId)
    .single();
  if (eventErr || !eventRow) {
    return { success: false, error: "Event not found" };
  }
  const teamSize = (eventRow.team_size || 2) as TeamSize;
  const rotationType = eventRow.rotation_type as RotationType;

  const { data: assignmentRow, error: assignErr } = await supabase
    .from("court_assignments")
    .select("*")
    .eq("id", assignmentId)
    .eq("event_id", eventId)
    .single();
  if (assignErr || !assignmentRow) {
    return { success: false, error: "Assignment not found" };
  }

  if (assignmentRow.ended_at) {
    return { success: false, error: "Game already ended" };
  }

  const assignedPlayerIds = [
    assignmentRow.player1_id,
    assignmentRow.player2_id,
    assignmentRow.player3_id,
    assignmentRow.player4_id,
    assignmentRow.player5_id,
    assignmentRow.player6_id,
    assignmentRow.player7_id,
    assignmentRow.player8_id,
  ].filter(Boolean) as string[];
  const userOnCourt = assignedPlayerIds.some((pid) => pid === user.id);
  if (!profile?.is_admin && !userOnCourt) {
    return { success: false, error: "Unauthorized" };
  }

  const db = createServiceRoleClient();
  if (!db) {
    console.error("endGameAndReorderQueue: SUPABASE_SERVICE_ROLE_KEY missing");
    return {
      success: false,
      error: "Server configuration error",
    };
  }

  let queueEntryIds: string[] = [];
  const rawIds = assignmentRow.queue_entry_ids;
  if (rawIds) {
    try {
      const p = rawIds as unknown as string[];
      if (Array.isArray(p)) queueEntryIds = p;
    } catch {
      /* empty */
    }
  }
  if (queueEntryIds.length === 0) {
    const allPlayers = [
      assignmentRow.player1_id,
      assignmentRow.player2_id,
      assignmentRow.player3_id,
      assignmentRow.player4_id,
      assignmentRow.player5_id,
      assignmentRow.player6_id,
      assignmentRow.player7_id,
      assignmentRow.player8_id,
    ].filter(Boolean) as string[];
    const { data: entries } = await db
      .from("queue_entries")
      .select("id")
      .eq("event_id", eventId)
      .in("user_id", allPlayers);
    if (entries) queueEntryIds = entries.map((e) => e.id);
  }

  const { data: gameEntries } = await db
    .from("queue_entries")
    .select("id, user_id, group_size, position")
    .in("id", queueEntryIds);
  const entriesById = new Map(
    (gameEntries || []).map((e) => [e.id, e as GameEntryRow]),
  );

  const queueEntryToTeam = new Map<string, "team1" | "team2">();
  let slotIndex = 0;
  for (const entryId of queueEntryIds) {
    const entry = entriesById.get(entryId);
    if (!entry) continue;
    const groupSize = entry.group_size || 1;
    const endSlot = slotIndex + groupSize - 1;
    if (endSlot < teamSize) {
      queueEntryToTeam.set(entryId, "team1");
    } else if (slotIndex >= teamSize) {
      queueEntryToTeam.set(entryId, "team2");
    } else {
      if (teamSize - slotIndex >= endSlot - teamSize + 1) {
        queueEntryToTeam.set(entryId, "team1");
      } else {
        queueEntryToTeam.set(entryId, "team2");
      }
    }
    slotIndex += groupSize;
  }

  const winnerEntryIds = new Set<string>();
  for (const [eid, team] of queueEntryToTeam) {
    if (team === winningTeam) winnerEntryIds.add(eid);
  }

  const { error: endErr } = await db
    .from("court_assignments")
    .update({ ended_at: new Date().toISOString() })
    .eq("id", assignmentId);
  if (endErr) {
    console.error("Error ending game:", endErr);
    return { success: false, error: "Failed to end game" };
  }

  const courtNumber = assignmentRow.court_number;

  await db
    .from("court_pending_stayers")
    .delete()
    .eq("event_id", eventId)
    .eq("court_number", courtNumber);

  const ar = assignmentRow as Record<string, string | null | undefined>;

  for (const entryId of queueEntryIds) {
    const isWinner = winnerEntryIds.has(entryId);
    if (isWinnersStayStyleRotation(rotationType)) {
      if (isWinner) {
        await db
          .from("queue_entries")
          .update({ status: "pending_stay" })
          .eq("id", entryId);
      } else {
        await db
          .from("queue_entries")
          .update({ status: "waiting" })
          .eq("id", entryId);
      }
    } else {
      await db
        .from("queue_entries")
        .update({ status: "waiting" })
        .eq("id", entryId);
    }
  }

  const { data: allWaitingRows } = await db
    .from("queue_entries")
    .select("id, user_id, group_size, position")
    .eq("event_id", eventId)
    .eq("status", "waiting")
    .order("position");

  const allWaiting = allWaitingRows || [];
  const otherEntries = allWaiting.filter((e) => !queueEntryIds.includes(e.id));
  const losingSide = winningTeam === "team1" ? "team2" : "team1";
  const loserIdsOrdered = getSideEntryIdsSlotOrder(
    ar,
    teamSize,
    queueEntryIds,
    entriesById,
    losingSide,
  );

  let pos = 1;
  if (isRotateAllStyleRotation(rotationType)) {
    const participantsOrdered = getAllParticipantEntryIdsSlotOrder(
      ar,
      teamSize,
      queueEntryIds,
      entriesById,
    );
    for (const e of otherEntries) {
      await db
        .from("queue_entries")
        .update({ position: pos })
        .eq("id", e.id);
      pos++;
    }
    for (const eid of participantsOrdered) {
      await db
        .from("queue_entries")
        .update({ position: pos })
        .eq("id", eid);
      pos++;
    }
  } else if (isWinnersStayStyleRotation(rotationType)) {
    for (const e of otherEntries) {
      await db
        .from("queue_entries")
        .update({ position: pos })
        .eq("id", e.id);
      pos++;
    }
    for (const eid of loserIdsOrdered) {
      await db
        .from("queue_entries")
        .update({ position: pos })
        .eq("id", eid);
      pos++;
    }
    const winningSide = winningTeam;
    const winnerIdsOrdered = getSideEntryIdsSlotOrder(
      ar,
      teamSize,
      queueEntryIds,
      entriesById,
      winningSide,
    );
    if (winnerIdsOrdered.length > 0) {
      await db.from("court_pending_stayers").upsert(
        {
          event_id: eventId,
          court_number: courtNumber,
          queue_entry_ids: winnerIdsOrdered,
        },
        { onConflict: "event_id,court_number" },
      );
    }
  } else {
    const participantsOrdered = getAllParticipantEntryIdsSlotOrder(
      ar,
      teamSize,
      queueEntryIds,
      entriesById,
    );
    for (const e of otherEntries) {
      await db
        .from("queue_entries")
        .update({ position: pos })
        .eq("id", e.id);
      pos++;
    }
    for (const eid of participantsOrdered) {
      await db
        .from("queue_entries")
        .update({ position: pos })
        .eq("id", eid);
      pos++;
    }
  }

  await reconcilePendingSoloForEvent(eventId, db);
  await reorderQueue(eventId, { db, flushQueueNotifications });

  return { success: true };
}
