import { sendQueueNotification } from "@/app/actions/notifications";
import { runQueueMaintenance } from "@/lib/queue/services/maintenance";
import {
  nextQueuePosition,
  promotePendingSolosWhenPossible,
  resolveInsertStatusForJoin,
  twoStayTwoOffValidationError,
} from "@/lib/queue/services/queue-membership-helpers";
import { createClient } from "@/lib/supabase/server";

import type { JoinQueueServiceInput } from "@/lib/queue/services/queue-membership-types";
import type { RotationType } from "@/lib/types";

async function assertJoinUserMatches(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.id !== userId) {
    return { ok: false as const, error: "Not authenticated" as const };
  }
  return { ok: true as const };
}

async function loadEventRotationRow(
  supabase: Awaited<ReturnType<typeof createClient>>,
  eventId: string,
) {
  const { data: eventRow } = await supabase
    .from("events")
    .select("rotation_type, team_size")
    .eq("id", eventId)
    .single();
  const eventRotation = (eventRow?.rotation_type as RotationType) ?? "rotate-all";
  return { eventRow, eventRotation };
}

async function assertJoinAllowed(
  supabase: Awaited<ReturnType<typeof createClient>>,
  input: JoinQueueServiceInput,
) {
  const auth = await assertJoinUserMatches(supabase, input.userId);
  if (!auth.ok) return { ok: false as const, error: auth.error };
  const { eventRow, eventRotation } = await loadEventRotationRow(supabase, input.eventId);
  const ruleErr = twoStayTwoOffValidationError(
    eventRotation,
    eventRow?.team_size,
    input.groupId,
    input.groupSize,
  );
  if (ruleErr) return { ok: false as const, error: ruleErr };
  return { ok: true as const };
}

type AfterJoinParams = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  input: JoinQueueServiceInput;
  groupSize: number;
  insertStatus: "waiting" | "pending_solo";
  position: number;
};

async function runAfterJoinBookkeeping(p: AfterJoinParams) {
  await promotePendingSolosWhenPossible(
    p.supabase,
    p.input.eventId,
    p.groupSize,
    p.insertStatus,
  );
  await runQueueMaintenance(p.input.eventId, {
    flushQueueNotifications: p.input.deps.flushQueueNotifications,
  });
  await sendQueueNotification({
    userId: p.input.userId,
    eventId: p.input.eventId,
    position: p.position,
    notificationType: "join",
  }).catch((err) => console.error("Failed to send join email:", err));
}

async function insertJoinedQueueEntry(
  supabase: Awaited<ReturnType<typeof createClient>>,
  input: Pick<
    JoinQueueServiceInput,
    "eventId" | "userId" | "groupId" | "groupSize" | "playerNames"
  >,
  position: number,
  insertStatus: "waiting" | "pending_solo",
) {
  const row = {
    event_id: input.eventId,
    user_id: input.userId,
    group_id: input.groupId,
    group_size: input.groupSize,
    player_names: input.playerNames || [],
    position,
    status: insertStatus,
  };
  const { data, error } = await supabase.from("queue_entries").insert(row).select().single();
  if (error) {
    console.error("Error joining queue:", error);
    return { data: null as null, error: error.message };
  }
  return { data, error: null as null };
}

export async function joinQueueService(input: JoinQueueServiceInput) {
  const { eventId, userId, groupSize, groupId, playerNames } = input;
  const supabase = await createClient();
  const allowed = await assertJoinAllowed(supabase, input);
  if (!allowed.ok) return { error: allowed.error };

  const position = await nextQueuePosition(supabase, eventId);
  const insertStatus = await resolveInsertStatusForJoin(supabase, eventId, groupSize);
  const inserted = await insertJoinedQueueEntry(
    supabase,
    { eventId, userId, groupId, groupSize, playerNames },
    position,
    insertStatus,
  );
  if (inserted.error) return { error: inserted.error } as const;

  await runAfterJoinBookkeeping({
    supabase,
    input,
    groupSize,
    insertStatus,
    position,
  });
  return { data: inserted.data, error: null };
}
