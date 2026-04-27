import { createClient } from "@/lib/supabase/server";

import type { DbClient } from "@/lib/queue/types";
import type { TeamSize } from "@/lib/types";

/** Subsets of group indices whose sizes sum to `target` (same semantics as QueueManager). */
function collectExactCombinationIndices(
  groupSizes: number[],
  target: number,
  startIdx: number,
  current: number[],
  currentSum: number,
  out: number[][],
): void {
  if (currentSum === target) {
    out.push([...current]);
    return;
  }
  if (currentSum > target || startIdx >= groupSizes.length) {
    return;
  }
  collectExactCombinationIndices(
    groupSizes,
    target,
    startIdx + 1,
    [...current, startIdx],
    currentSum + groupSizes[startIdx],
    out,
  );
  collectExactCombinationIndices(
    groupSizes,
    target,
    startIdx + 1,
    current,
    currentSum,
    out,
  );
}

function soloGroupIndexCanFillCourt(
  groupSizes: number[],
  soloGroupIdx: number,
  playersPerCourt: number,
): boolean {
  const solutions: number[][] = [];
  collectExactCombinationIndices(
    groupSizes,
    playersPerCourt,
    0,
    [],
    0,
    solutions,
  );
  return solutions.some((sol) => sol.includes(soloGroupIdx));
}

/**
 * Promotes pending solos when 2+ solos exist; demotes a lone waiting solo when
 * no full-court combination can include them (e.g. one solo + only duos for doubles).
 * TODO: optional email when status flips waiting <-> pending_solo
 */
export async function reconcilePendingSoloForEvent(
  eventId: string,
  db?: DbClient,
) {
  const supabase = db ?? (await createClient());

  const { data: eventRow } = await supabase
    .from("events")
    .select("team_size")
    .eq("id", eventId)
    .single();

  const teamSize = (eventRow?.team_size || 2) as TeamSize;
  const playersPerCourt = teamSize * 2;

  const { data: soloRows } = await supabase
    .from("queue_entries")
    .select("id")
    .eq("event_id", eventId)
    .in("status", ["waiting", "pending_solo"])
    .eq("group_size", 1);

  const soloCount = soloRows?.length ?? 0;
  if (soloCount >= 2) {
    await supabase
      .from("queue_entries")
      .update({ status: "waiting" })
      .eq("event_id", eventId)
      .eq("status", "pending_solo")
      .eq("group_size", 1);
  }

  const { data: waitingRows } = await supabase
    .from("queue_entries")
    .select("id, group_size, group_id, position")
    .eq("event_id", eventId)
    .eq("status", "waiting")
    .order("position");

  if (!waitingRows?.length) {
    return;
  }

  const groups: { ids: string[]; size: number }[] = [];
  const processedGroupIds = new Set<string>();

  for (const row of waitingRows) {
    const gid = row.group_id;
    if (gid && !processedGroupIds.has(gid)) {
      const members = waitingRows.filter((r) => r.group_id === gid);
      processedGroupIds.add(gid);
      const size = members.reduce((s, m) => s + (m.group_size || 1), 0);
      groups.push({ ids: members.map((m) => m.id), size });
    } else if (!gid) {
      groups.push({ ids: [row.id], size: row.group_size || 1 });
    }
  }

  const soloGroups = groups
    .map((g, idx) => ({ g, idx }))
    .filter(({ g }) => g.size === 1);
  if (soloGroups.length !== 1) {
    return;
  }

  const soloGroupIdx = soloGroups[0].idx;
  const groupSizes = groups.map((g) => g.size);

  if (soloGroupIndexCanFillCourt(groupSizes, soloGroupIdx, playersPerCourt)) {
    return;
  }

  const soloEntryId = soloGroups[0].g.ids[0];
  await supabase
    .from("queue_entries")
    .update({ status: "pending_solo" })
    .eq("id", soloEntryId);
}
