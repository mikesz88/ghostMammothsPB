import { soloGroupIndexCanFillCourt } from "@/lib/queue/pending-solo-combinations";
import { createClient } from "@/lib/supabase/server";

import type { DbClient } from "@/lib/queue/types";
import type { TeamSize } from "@/lib/types";

async function promotePendingSolosWhenPair(
  supabase: DbClient,
  eventId: string,
  soloCount: number,
) {
  if (soloCount < 2) return;
  await supabase
    .from("queue_entries")
    .update({ status: "waiting" })
    .eq("event_id", eventId)
    .eq("status", "pending_solo")
    .eq("group_size", 1);
}

function buildWaitingGroups(
  waitingRows: Array<{
    id: string;
    group_size: number | null;
    group_id: string | null;
    position: number;
  }>,
) {
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
  return groups;
}

async function demoteBlockedSoloIfNeeded(
  supabase: DbClient,
  groups: { ids: string[]; size: number }[],
  playersPerCourt: number,
) {
  const soloGroups = groups
    .map((g, idx) => ({ g, idx }))
    .filter(({ g }) => g.size === 1);
  if (soloGroups.length !== 1) return;
  const soloGroupIdx = soloGroups[0].idx;
  const groupSizes = groups.map((g) => g.size);
  if (soloGroupIndexCanFillCourt(groupSizes, soloGroupIdx, playersPerCourt)) {
    return;
  }
  const soloEntryId = soloGroups[0].g.ids[0];
  await supabase.from("queue_entries").update({ status: "pending_solo" }).eq("id", soloEntryId);
}

async function loadTeamSizeForReconcile(
  supabase: DbClient,
  eventId: string,
): Promise<TeamSize> {
  const { data: eventRow } = await supabase
    .from("events")
    .select("team_size")
    .eq("id", eventId)
    .single();
  return (eventRow?.team_size || 2) as TeamSize;
}

/**
 * Promotes pending solos when 2+ solos exist; demotes a lone waiting solo when
 * no full-court combination can include them (e.g. one solo + only duos for doubles).
 * TODO: optional email when status flips waiting <-> pending_solo
 */
export async function reconcilePendingSoloForEvent(eventId: string, db?: DbClient) {
  const supabase = db ?? (await createClient());
  const teamSize = await loadTeamSizeForReconcile(supabase, eventId);
  const playersPerCourt = teamSize * 2;

  const { data: soloRows } = await supabase
    .from("queue_entries")
    .select("id")
    .eq("event_id", eventId)
    .in("status", ["waiting", "pending_solo"])
    .eq("group_size", 1);
  await promotePendingSolosWhenPair(supabase, eventId, soloRows?.length ?? 0);

  const { data: waitingRows } = await supabase
    .from("queue_entries")
    .select("id, group_size, group_id, position")
    .eq("event_id", eventId)
    .eq("status", "waiting")
    .order("position");
  if (!waitingRows?.length) return;
  const groups = buildWaitingGroups(waitingRows);
  await demoteBlockedSoloIfNeeded(supabase, groups, playersPerCourt);
}
