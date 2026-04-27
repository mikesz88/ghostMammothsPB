import {
  getAllParticipantEntryIdsSlotOrder,
  getSideEntryIdsSlotOrder,
} from "@/lib/queue/assignment-helpers";
import {
  isRotateAllStyleRotation,
  isWinnersStayStyleRotation,
} from "@/lib/rotation-policy";

import type { GameEntryRow } from "@/lib/queue/types";
import type { RotationType, TeamSize } from "@/lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";

type WaitingRow = {
  id: string;
  user_id: string;
  group_size: number | null;
  position: number;
};

export type EndGameResequenceParams = {
  db: SupabaseClient;
  eventId: string;
  rotationType: RotationType;
  teamSize: TeamSize;
  winningTeam: "team1" | "team2";
  courtNumber: number;
  queueEntryIds: string[];
  entriesById: Map<string, GameEntryRow>;
  ar: Record<string, string | null | undefined>;
  allWaiting: WaitingRow[];
};

async function bumpPositions(
  db: SupabaseClient,
  idsInOrder: string[],
  startPos: { value: number },
) {
  for (const id of idsInOrder) {
    await db.from("queue_entries").update({ position: startPos.value }).eq("id", id);
    startPos.value += 1;
  }
}

async function repositionOtherWaitingEntries(
  p: EndGameResequenceParams,
  pos: { value: number },
) {
  const other = p.allWaiting.filter((e) => !p.queueEntryIds.includes(e.id));
  for (const e of other) {
    await p.db.from("queue_entries").update({ position: pos.value }).eq("id", e.id);
    pos.value += 1;
  }
}

async function applyRotateAllResequence(p: EndGameResequenceParams, pos: { value: number }) {
  await repositionOtherWaitingEntries(p, pos);
  const participantsOrdered = getAllParticipantEntryIdsSlotOrder(
    p.ar,
    p.teamSize,
    p.queueEntryIds,
    p.entriesById,
  );
  await bumpPositions(p.db, participantsOrdered, pos);
}

async function upsertCourtPendingStayersForWinners(
  db: SupabaseClient,
  eventId: string,
  courtNumber: number,
  winnerIdsOrdered: string[],
) {
  if (winnerIdsOrdered.length === 0) return;
  await db.from("court_pending_stayers").upsert(
    {
      event_id: eventId,
      court_number: courtNumber,
      queue_entry_ids: winnerIdsOrdered,
    },
    { onConflict: "event_id,court_number" },
  );
}

async function applyWinnersStayResequence(p: EndGameResequenceParams, pos: { value: number }) {
  await repositionOtherWaitingEntries(p, pos);
  const losingSide = p.winningTeam === "team1" ? "team2" : "team1";
  const loserIdsOrdered = getSideEntryIdsSlotOrder({
    assignmentRow: p.ar,
    teamSize: p.teamSize,
    gameQueueEntryIds: p.queueEntryIds,
    entriesById: p.entriesById,
    side: losingSide,
  });
  await bumpPositions(p.db, loserIdsOrdered, pos);
  const winnerIdsOrdered = getSideEntryIdsSlotOrder({
    assignmentRow: p.ar,
    teamSize: p.teamSize,
    gameQueueEntryIds: p.queueEntryIds,
    entriesById: p.entriesById,
    side: p.winningTeam,
  });
  await upsertCourtPendingStayersForWinners(
    p.db,
    p.eventId,
    p.courtNumber,
    winnerIdsOrdered,
  );
}

async function applyDefaultResequence(p: EndGameResequenceParams, pos: { value: number }) {
  await repositionOtherWaitingEntries(p, pos);
  const participantsOrdered = getAllParticipantEntryIdsSlotOrder(
    p.ar,
    p.teamSize,
    p.queueEntryIds,
    p.entriesById,
  );
  await bumpPositions(p.db, participantsOrdered, pos);
}

export async function resequenceWaitingAfterEndGame(p: EndGameResequenceParams) {
  const pos = { value: 1 };
  if (isRotateAllStyleRotation(p.rotationType)) {
    await applyRotateAllResequence(p, pos);
    return;
  }
  if (isWinnersStayStyleRotation(p.rotationType)) {
    await applyWinnersStayResequence(p, pos);
    return;
  }
  await applyDefaultResequence(p, pos);
}
