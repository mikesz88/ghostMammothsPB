import type { GameEntryRow } from "@/lib/queue/types";

const ASSIGNMENT_PLAYER_KEYS = [
  "player1_id",
  "player2_id",
  "player3_id",
  "player4_id",
  "player5_id",
  "player6_id",
  "player7_id",
  "player8_id",
] as const;

function entryIdForGameUser(
  gameQueueEntryIds: string[],
  userId: string,
  entriesById: Map<string, GameEntryRow>,
): string | undefined {
  for (const eid of gameQueueEntryIds) {
    const e = entriesById.get(eid);
    if (e?.user_id === userId) return eid;
  }
  return undefined;
}

export type SideEntryIdsSlotOrderParams = {
  assignmentRow: Record<string, string | null | undefined>;
  teamSize: number;
  gameQueueEntryIds: string[];
  entriesById: Map<string, GameEntryRow>;
  side: "team1" | "team2";
};

/** Queue entry ids for one side in court slot order (player1 ->), unique entries first-seen. */
export function getSideEntryIdsSlotOrder(
  params: SideEntryIdsSlotOrderParams,
): string[] {
  const { assignmentRow, teamSize, gameQueueEntryIds, entriesById, side } =
    params;
  const out: string[] = [];
  const seen = new Set<string>();
  for (let slotIdx = 0; slotIdx < teamSize * 2; slotIdx++) {
    const key = ASSIGNMENT_PLAYER_KEYS[slotIdx];
    const uid = assignmentRow[key];
    if (!uid) continue;
    const team: "team1" | "team2" = slotIdx < teamSize ? "team1" : "team2";
    if (team !== side) continue;
    const eid = entryIdForGameUser(gameQueueEntryIds, uid, entriesById);
    if (eid && !seen.has(eid)) {
      seen.add(eid);
      out.push(eid);
    }
  }
  return out;
}

/** All participants in slot order (both teams), unique entries first-seen. */
export function getAllParticipantEntryIdsSlotOrder(
  assignmentRow: Record<string, string | null | undefined>,
  teamSize: number,
  gameQueueEntryIds: string[],
  entriesById: Map<string, GameEntryRow>,
): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (let slotIdx = 0; slotIdx < teamSize * 2; slotIdx++) {
    const key = ASSIGNMENT_PLAYER_KEYS[slotIdx];
    const uid = assignmentRow[key];
    if (!uid) continue;
    const eid = entryIdForGameUser(gameQueueEntryIds, uid, entriesById);
    if (eid && !seen.has(eid)) {
      seen.add(eid);
      out.push(eid);
    }
  }
  return out;
}
