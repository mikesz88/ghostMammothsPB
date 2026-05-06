import { is2Stay2OffRotation } from "@/lib/rotation-policy";
import { createClient } from "@/lib/supabase/server";

import type { RotationType } from "@/lib/types";

export function twoStayTwoOffValidationError(
  eventRotation: RotationType,
  teamSize: number | null | undefined,
  groupId: string | undefined,
  groupSize: number,
): string | null {
  if (!is2Stay2OffRotation(eventRotation)) return null;
  if ((teamSize ?? 2) !== 2) {
    return "2 Stay 2 Off is only available for doubles events (team size 2).";
  }
  if (groupId) {
    return "2 Stay 2 Off only allows solo queue entries (no groups).";
  }
  if (groupSize !== 1) {
    return "2 Stay 2 Off only allows solo queue entries.";
  }
  return null;
}

export async function nextQueuePosition(
  supabase: Awaited<ReturnType<typeof createClient>>,
  eventId: string,
): Promise<number> {
  const { data: currentQueue } = await supabase
    .from("queue_entries")
    .select("position")
    .eq("event_id", eventId)
    .in("status", ["waiting", "pending_solo"])
    .order("position", { ascending: false })
    .limit(1);

  return currentQueue?.[0]?.position ? currentQueue[0].position + 1 : 1;
}

export async function resolveInsertStatusForJoin(
  supabase: Awaited<ReturnType<typeof createClient>>,
  eventId: string,
  groupSize: number,
): Promise<"waiting" | "pending_solo"> {
  if (groupSize !== 1) return "waiting";
  const { count: existingSoloCount } = await supabase
    .from("queue_entries")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId)
    .in("status", ["waiting", "pending_solo"])
    .eq("group_size", 1);
  const n = existingSoloCount ?? 0;
  return n >= 1 ? "waiting" : "pending_solo";
}

export async function promotePendingSolosWhenPossible(
  supabase: Awaited<ReturnType<typeof createClient>>,
  eventId: string,
  groupSize: number,
  insertStatus: "waiting" | "pending_solo",
) {
  if (groupSize === 1 && insertStatus === "waiting") {
    await supabase
      .from("queue_entries")
      .update({ status: "waiting" })
      .eq("event_id", eventId)
      .eq("status", "pending_solo")
      .eq("group_size", 1);
  }
}
