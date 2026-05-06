import type { GameEntryRow } from "@/lib/queue/types";
import type { TeamSize } from "@/lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";

function parseQueueEntryIdsFromJson(raw: unknown): string[] {
  if (!raw) return [];
  const p = raw as unknown;
  if (!Array.isArray(p)) return [];
  return p as string[];
}

export function userIdsOnCourt(ar: Record<string, string | null | undefined>): string[] {
  const out: string[] = [];
  for (let i = 1; i <= 8; i += 1) {
    const v = ar[`player${i}_id`];
    if (v) out.push(v);
  }
  return out;
}

export async function resolveQueueEntryIdsForAssignment(
  db: SupabaseClient,
  eventId: string,
  ar: Record<string, string | null | undefined>,
): Promise<string[]> {
  const fromJson = parseQueueEntryIdsFromJson(ar.queue_entry_ids);
  if (fromJson.length > 0) return fromJson;
  const allPlayers = userIdsOnCourt(ar);
  const { data: entries } = await db
    .from("queue_entries")
    .select("id")
    .eq("event_id", eventId)
    .in("user_id", allPlayers);
  return (entries || []).map((e) => e.id);
}

function teamForEntrySlot(
  slotIndex: number,
  groupSize: number,
  teamSize: TeamSize,
): "team1" | "team2" {
  const endSlot = slotIndex + groupSize - 1;
  if (endSlot < teamSize) return "team1";
  if (slotIndex >= teamSize) return "team2";
  if (teamSize - slotIndex >= endSlot - teamSize + 1) return "team1";
  return "team2";
}

export function computeWinnerEntryIds(
  queueEntryIds: string[],
  entriesById: Map<string, GameEntryRow>,
  teamSize: TeamSize,
  winningTeam: "team1" | "team2",
): Set<string> {
  const queueEntryToTeam = new Map<string, "team1" | "team2">();
  let slotIndex = 0;
  for (const entryId of queueEntryIds) {
    const entry = entriesById.get(entryId);
    if (!entry) continue;
    const groupSize = entry.group_size || 1;
    queueEntryToTeam.set(entryId, teamForEntrySlot(slotIndex, groupSize, teamSize));
    slotIndex += groupSize;
  }
  const winnerEntryIds = new Set<string>();
  for (const [eid, team] of queueEntryToTeam) {
    if (team === winningTeam) winnerEntryIds.add(eid);
  }
  return winnerEntryIds;
}

export async function fetchGameEntriesMap(
  db: SupabaseClient,
  queueEntryIds: string[],
): Promise<Map<string, GameEntryRow>> {
  if (queueEntryIds.length === 0) return new Map();
  const { data: gameEntries } = await db
    .from("queue_entries")
    .select("id, user_id, group_size, position")
    .in("id", queueEntryIds);
  return new Map((gameEntries || []).map((e) => [e.id, e as GameEntryRow]));
}
