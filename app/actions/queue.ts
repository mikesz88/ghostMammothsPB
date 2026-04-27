"use server";

import { revalidatePath } from "next/cache";

import {
  is2Stay2OffRotation,
  isRotateAllStyleRotation,
  isWinnersStayStyleRotation,
} from "@/lib/rotation-policy";
import {
  getAllParticipantEntryIdsSlotOrder,
  getSideEntryIdsSlotOrder,
} from "@/lib/queue/assignment-helpers";
import { countSlotsForEntries, mapDbEntryToManagerEntry } from "@/lib/queue/mappers";
import { reconcilePendingSoloForEvent } from "@/lib/queue/pending-solo";
import { removeQueueEntryIdsFromCourtPendingStayers } from "@/lib/queue/pending-stayers";
import { reorderQueue as reorderQueueService } from "@/lib/queue/services/queue-ordering";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

import {
  flushQueueEmailNotifications,
  sendQueueNotification,
} from "./notifications";

import type { DbClient, CourtAssignmentInsert, GameEntryRow, QueueEntryWithUser } from "@/lib/queue/types";
import type { RotationType, TeamSize } from "@/lib/types";

export { reconcilePendingSoloForEvent };

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
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== userId) {
    return { error: "Not authenticated" };
  }

  const { data: eventRow } = await supabase
    .from("events")
    .select("rotation_type, team_size")
    .eq("id", eventId)
    .single();

  const eventRotation = (eventRow?.rotation_type as RotationType) ?? "rotate-all";
  if (is2Stay2OffRotation(eventRotation)) {
    if ((eventRow?.team_size ?? 2) !== 2) {
      return {
        error:
          "2 Stay 2 Off is only available for doubles events (team size 2).",
      };
    }
    if (groupId) {
      return {
        error: "2 Stay 2 Off only allows solo queue entries (no groups).",
      };
    }
    if (groupSize !== 1) {
      return {
        error: "2 Stay 2 Off only allows solo queue entries.",
      };
    }
  }

  const { data: currentQueue } = await supabase
    .from("queue_entries")
    .select("position")
    .eq("event_id", eventId)
    .in("status", ["waiting", "pending_solo"])
    .order("position", { ascending: false })
    .limit(1);

  const position = currentQueue?.[0]?.position
    ? currentQueue[0].position + 1
    : 1;

  let insertStatus: "waiting" | "pending_solo" = "waiting";
  if (groupSize === 1) {
    const { count: existingSoloCount } = await supabase
      .from("queue_entries")
      .select("*", { count: "exact", head: true })
      .eq("event_id", eventId)
      .in("status", ["waiting", "pending_solo"])
      .eq("group_size", 1);
    const n = existingSoloCount ?? 0;
    insertStatus = n >= 1 ? "waiting" : "pending_solo";
  }

  const { data, error } = await supabase
    .from("queue_entries")
    .insert({
      event_id: eventId,
      user_id: userId,
      group_id: groupId,
      group_size: groupSize,
      player_names: playerNames || [],
      position: position,
      status: insertStatus,
    })
    .select()
    .single();

  if (error) {
    console.error("Error joining queue:", error);
    return { error: error.message };
  }

  if (groupSize === 1 && insertStatus === "waiting") {
    await supabase
      .from("queue_entries")
      .update({ status: "waiting" })
      .eq("event_id", eventId)
      .eq("status", "pending_solo")
      .eq("group_size", 1);
  }

  await reconcilePendingSoloForEvent(eventId);
  await reorderQueue(eventId);

  // Send email notification (async, don't await to avoid blocking)
  await sendQueueNotification(userId, eventId, position, "join").catch((err) =>
    console.error("Failed to send join email:", err),
  );

  revalidatePath(`/events/${eventId}`);
  return { data, error: null };
}

export async function leaveQueue(queueEntryId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  // Get the queue entry to verify ownership
  const { data: entry } = await supabase
    .from("queue_entries")
    .select("*")
    .eq("id", queueEntryId)
    .single();

  if (!entry || entry.user_id !== user.id) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("queue_entries")
    .delete()
    .eq("id", queueEntryId);

  if (error) {
    console.error("Error leaving queue:", error);
    return { error: error.message };
  }

  await removeQueueEntryIdsFromCourtPendingStayers(supabase, entry.event_id, [
    queueEntryId,
  ]);

  // Reorder remaining queue positions
  await reorderQueue(entry.event_id);
  await reconcilePendingSoloForEvent(entry.event_id);
  await reorderQueue(entry.event_id);

  revalidatePath(`/events/${entry.event_id}`);
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
  await reorderQueue(eventId, db);

  revalidatePath(`/events/${eventId}`);
  revalidatePath(`/admin/events/${eventId}`);

  return { success: true };
}

export async function assignPlayersToNextCourt(eventId: string) {
  const supabase = await createClient();

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (eventError || !event) {
    return { success: false, error: "Event not found" };
  }

  const playersPerCourt = event.team_size * 2;

  const { data: activeAssignments } = await supabase
    .from("court_assignments")
    .select("court_number")
    .eq("event_id", eventId)
    .is("ended_at", null);

  const activeCourts = new Set(
    activeAssignments?.map((a) => a.court_number) || [],
  );

  let availableCourt: number | null = null;
  for (let i = 1; i <= event.court_count; i++) {
    if (!activeCourts.has(i)) {
      availableCourt = i;
      break;
    }
  }

  if (availableCourt === null) {
    return { success: false, error: "No available courts" };
  }

  await supabase
    .from("court_assignments")
    .delete()
    .eq("event_id", eventId)
    .eq("court_number", availableCourt)
    .not("ended_at", "is", null);

  const { QueueManager } = await import("@/lib/queue-manager");

  const { data: pendingRow } = await supabase
    .from("court_pending_stayers")
    .select("*")
    .eq("event_id", eventId)
    .eq("court_number", availableCourt)
    .maybeSingle();

  let stayingMapped: ReturnType<typeof mapDbEntryToManagerEntry>[] = [];

  const pendingIds = pendingRow?.queue_entry_ids;
  if (
    pendingRow &&
    Array.isArray(pendingIds) &&
    (pendingIds as string[]).length > 0
  ) {
    const ids = pendingIds as string[];
    const { data: stayRows, error: stayErr } = await supabase
      .from("queue_entries")
      .select(
        `
        *,
        user:users(id, name, email, skill_level)
      `,
      )
      .in("id", ids);

    if (stayErr) {
      return { success: false, error: "Failed to load pending stayers" };
    }

    const byId = new Map(
      (stayRows || []).map((r) => [r.id, r as QueueEntryWithUser]),
    );
    const ordered = ids
      .map((id) => byId.get(id))
      .filter((r): r is QueueEntryWithUser => Boolean(r));

    if (ordered.length === 0) {
      await supabase
        .from("court_pending_stayers")
        .delete()
        .eq("event_id", eventId)
        .eq("court_number", availableCourt);
    } else {
      stayingMapped = ordered.map(mapDbEntryToManagerEntry);
      const sc = countSlotsForEntries(stayingMapped);
      if (sc > playersPerCourt) {
        return {
          success: false,
          error: "Pending stayers exceed court capacity.",
        };
      }
    }
  }

  const rotationType = event.rotation_type as RotationType;

  const stayingCount = countSlotsForEntries(stayingMapped);
  const playersNeeded = playersPerCourt - stayingCount;

  if (playersNeeded < 0) {
    return {
      success: false,
      error: "Invalid pending stayer count for this court.",
    };
  }

  const { data: queueData, error: queueError } = await supabase
    .from("queue_entries")
    .select(
      `
      *,
      user:users(id, name, email, skill_level)
    `,
    )
    .eq("event_id", eventId)
    .eq("status", "waiting")
    .order("position");

  if (queueError) {
    return { success: false, error: "Failed to fetch queue" };
  }

  const waitingQueue = (queueData || []).map((entry: QueueEntryWithUser) =>
    mapDbEntryToManagerEntry(entry),
  );

  let newFromQueue: ReturnType<typeof mapDbEntryToManagerEntry>[] = [];
  if (playersNeeded > 0) {
    newFromQueue = QueueManager.getNextPlayers(
      waitingQueue,
      playersNeeded,
    ) as ReturnType<typeof mapDbEntryToManagerEntry>[];
    const got = countSlotsForEntries(newFromQueue);
    if (got < playersNeeded) {
      return {
        success: false,
        error: `Not enough players in queue. Need ${playersNeeded} more player slot(s) to fill the court.`,
      };
    }
  } else if (playersNeeded === 0 && stayingCount !== playersPerCourt) {
    return {
      success: false,
      error: "Pending stayers do not fill the court.",
    };
  }

  let nextPlayers: ReturnType<typeof mapDbEntryToManagerEntry>[] = [
    ...stayingMapped,
    ...newFromQueue,
  ];
  if (
    is2Stay2OffRotation(rotationType) &&
    event.team_size === 2 &&
    stayingMapped.length === 2 &&
    newFromQueue.length === 2 &&
    countSlotsForEntries(stayingMapped) === 2 &&
    countSlotsForEntries(newFromQueue) === 2
  ) {
    nextPlayers = [
      stayingMapped[0],
      newFromQueue[0],
      stayingMapped[1],
      newFromQueue[1],
    ];
  }

  const totalSlots = countSlotsForEntries(nextPlayers);
  if (totalSlots !== playersPerCourt) {
    return {
      success: false,
      error: "Could not form a full court from queue and pending stayers.",
    };
  }

  const assignmentData: CourtAssignmentInsert = {
    event_id: eventId,
    court_number: availableCourt,
    started_at: new Date().toISOString(),
    player_names: [],
    queue_entry_ids: nextPlayers.map((p) => p.id),
  };

  const playerSlots: Array<{
    userId: string;
    name: string;
    skillLevel: string;
  }> = [];

  for (const entry of nextPlayers) {
    const groupSize = entry.groupSize || 1;
    const playerNames = entry.player_names || [];

    if (playerNames.length > 0) {
      for (let i = 0; i < groupSize; i++) {
        playerSlots.push({
          userId: entry.userId,
          name: playerNames[i]?.name || entry.user?.name || "Player",
          skillLevel:
            playerNames[i]?.skillLevel ||
            entry.user?.skillLevel ||
            "intermediate",
        });
      }
    } else {
      for (let i = 0; i < groupSize; i++) {
        playerSlots.push({
          userId: entry.userId,
          name: entry.user?.name || "Player",
          skillLevel: entry.user?.skillLevel || "intermediate",
        });
      }
    }
  }

  assignmentData.player_names = playerSlots.map((p) => p.name);

  if (playerSlots[0]) assignmentData.player1_id = playerSlots[0].userId;
  if (playerSlots[1]) assignmentData.player2_id = playerSlots[1].userId;
  if (playerSlots[2]) assignmentData.player3_id = playerSlots[2].userId;
  if (playerSlots[3]) assignmentData.player4_id = playerSlots[3].userId;
  if (playerSlots[4]) assignmentData.player5_id = playerSlots[4].userId;
  if (playerSlots[5]) assignmentData.player6_id = playerSlots[5].userId;
  if (playerSlots[6]) assignmentData.player7_id = playerSlots[6].userId;
  if (playerSlots[7]) assignmentData.player8_id = playerSlots[7].userId;

  const { error: assignmentError } = await supabase
    .from("court_assignments")
    .insert(assignmentData);

  if (assignmentError) {
    console.error("Error creating assignment:", assignmentError);
    return {
      success: false,
      error: `Failed to assign players: ${assignmentError.message}`,
    };
  }

  if (pendingRow && stayingMapped.length > 0) {
    await supabase
      .from("court_pending_stayers")
      .delete()
      .eq("event_id", eventId)
      .eq("court_number", availableCourt);
  }

  for (const player of nextPlayers) {
    const { error: updateError } = await supabase
      .from("queue_entries")
      .update({ status: "playing" })
      .eq("id", player.id);

    if (updateError) {
      console.error(`Failed to update player ${player.id}:`, updateError);
    }
  }

  await flushQueueEmailNotifications(
    nextPlayers.map((player) => ({
      userId: player.userId,
      eventId,
      position: player.position,
      notificationType: "court-assignment" as const,
      courtNumber: availableCourt,
    })),
  ).catch((err) =>
    console.error("Failed to send court assignment emails:", err),
  );

  await reconcilePendingSoloForEvent(eventId);
  await reorderQueue(eventId);

  revalidatePath(`/events/${eventId}`);
  revalidatePath(`/admin/events/${eventId}`);

  return {
    success: true,
    courtNumber: availableCourt,
    playersAssigned: playersPerCourt,
  };
}

export async function adminRemoveFromQueue(queueEntryId: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (!user) {
    if (authError) {
      console.error("Failed to authenticate admin user:", authError);
    }
    return { error: "Not authenticated" };
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.error("Admin profile lookup failed:", profileError);
    return { error: `Profile error: ${profileError.message}` };
  }

  if (!profile?.is_admin) {
    return { error: "Unauthorized - Admin access required" };
  }

  const { data: entry, error: entryError } = await supabase
    .from("queue_entries")
    .select("*")
    .eq("id", queueEntryId)
    .single();

  if (entryError) {
    console.error("Queue entry lookup failed:", entryError);
    return { error: `Queue entry error: ${entryError.message}` };
  }

  if (!entry) {
    return { error: "Queue entry not found" };
  }

  const eventId = entry.event_id;
  let idsToPrune: string[] = [entry.id];
  if (entry.group_id) {
    const { data: groupRows, error: groupSelectError } = await supabase
      .from("queue_entries")
      .select("id")
      .eq("group_id", entry.group_id);
    if (groupSelectError) {
      console.error("Failed to list group queue entries:", groupSelectError);
      return { error: groupSelectError.message };
    }
    if (groupRows?.length) {
      idsToPrune = groupRows.map((r) => r.id);
    }
  }

  if (entry.group_id) {
    const { error: groupError } = await supabase
      .from("queue_entries")
      .delete()
      .eq("group_id", entry.group_id);

    if (groupError) {
      console.error("Failed to remove queue group entries:", groupError);
      return { error: groupError.message };
    }
  } else {
    const { error } = await supabase
      .from("queue_entries")
      .delete()
      .eq("id", queueEntryId);

    if (error) {
      console.error("Failed to remove queue entry:", error);
      return { error: error.message };
    }
  }

  await removeQueueEntryIdsFromCourtPendingStayers(supabase, eventId, idsToPrune);

  await reorderQueue(entry.event_id);
  await reconcilePendingSoloForEvent(entry.event_id);
  await reorderQueue(entry.event_id);

  revalidatePath(`/events/${entry.event_id}`);
  revalidatePath(`/admin/events/${entry.event_id}`);

  return { error: null };
}
