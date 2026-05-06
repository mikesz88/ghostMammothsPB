import {
  computeWinnerEntryIds,
  fetchGameEntriesMap,
  resolveQueueEntryIdsForAssignment,
  userIdsOnCourt,
} from "@/lib/queue/services/end-game-queue-ids";

import type { GameEntryRow } from "@/lib/queue/types";
import type { RotationType, TeamSize } from "@/lib/types";
import type { SupabaseClient } from "@supabase/supabase-js";

export type EndGameFailure = { success: false; error: string };

export type EndGameAuthSlice =
  | EndGameFailure
  | {
      success: true;
      teamSize: TeamSize;
      rotationType: RotationType;
      ar: Record<string, string | null | undefined>;
      courtNumber: number;
      assignmentRow: Record<string, unknown>;
    };

export type EndGameHydrated = {
  success: true;
  queueEntryIds: string[];
  entriesById: Map<string, GameEntryRow>;
  winnerEntryIds: Set<string>;
};

async function getAuthenticatedUserId(
  supabase: SupabaseClient,
): Promise<{ success: true; userId: string } | EndGameFailure> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };
  return { success: true, userId: user.id };
}

async function fetchProfileIsAdmin(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { data: profile } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", userId)
    .single();
  return Boolean(profile?.is_admin);
}

async function fetchEventTeamAndRotation(
  supabase: SupabaseClient,
  eventId: string,
): Promise<
  { success: true; teamSize: TeamSize; rotationType: RotationType } | EndGameFailure
> {
  const { data: eventRow, error: eventErr } = await supabase
    .from("events")
    .select("team_size, rotation_type")
    .eq("id", eventId)
    .single();
  if (eventErr || !eventRow) return { success: false, error: "Event not found" };
  return {
    success: true,
    teamSize: (eventRow.team_size || 2) as TeamSize,
    rotationType: eventRow.rotation_type as RotationType,
  };
}

async function fetchCourtAssignmentRow(
  supabase: SupabaseClient,
  eventId: string,
  assignmentId: string,
): Promise<{ success: true; row: Record<string, unknown> } | EndGameFailure> {
  const { data: assignmentRow, error: assignErr } = await supabase
    .from("court_assignments")
    .select("*")
    .eq("id", assignmentId)
    .eq("event_id", eventId)
    .single();
  if (assignErr || !assignmentRow) {
    return { success: false, error: "Assignment not found" };
  }
  return { success: true, row: assignmentRow as Record<string, unknown> };
}

function assertUserCanEndGame(
  userId: string,
  isAdmin: boolean,
  assignmentRow: Record<string, unknown>,
): EndGameFailure | null {
  const ar = assignmentRow as Record<string, string | null | undefined>;
  const onCourt = userIdsOnCourt(ar).some((pid) => pid === userId);
  if (!isAdmin && !onCourt) return { success: false, error: "Unauthorized" };
  return null;
}

function sliceFromAssignmentRow(
  eventMeta: { teamSize: TeamSize; rotationType: RotationType },
  row: Record<string, unknown>,
): Extract<EndGameAuthSlice, { success: true }> {
  const ar = row as Record<string, string | null | undefined>;
  return {
    success: true,
    teamSize: eventMeta.teamSize,
    rotationType: eventMeta.rotationType,
    ar,
    courtNumber: row.court_number as number,
    assignmentRow: row,
  };
}

export async function loadEndGameAuthSlice(
  supabase: SupabaseClient,
  eventId: string,
  assignmentId: string,
): Promise<EndGameAuthSlice> {
  const auth = await getAuthenticatedUserId(supabase);
  if (!auth.success) return auth;
  const isAdmin = await fetchProfileIsAdmin(supabase, auth.userId);
  const eventMeta = await fetchEventTeamAndRotation(supabase, eventId);
  if (!eventMeta.success) return eventMeta;
  const assignResult = await fetchCourtAssignmentRow(supabase, eventId, assignmentId);
  if (!assignResult.success) return assignResult;
  const row = assignResult.row;
  if (row.ended_at) return { success: false, error: "Game already ended" };
  const authz = assertUserCanEndGame(auth.userId, isAdmin, row);
  if (authz) return authz;
  return sliceFromAssignmentRow(eventMeta, row);
}

export async function hydrateEndGameQueueState(
  db: SupabaseClient,
  eventId: string,
  winningTeam: "team1" | "team2",
  slice: Extract<EndGameAuthSlice, { success: true }>,
): Promise<EndGameHydrated> {
  const queueEntryIds = await resolveQueueEntryIdsForAssignment(db, eventId, slice.ar);
  const entriesById = await fetchGameEntriesMap(db, queueEntryIds);
  const winnerEntryIds = computeWinnerEntryIds(
    queueEntryIds,
    entriesById,
    slice.teamSize,
    winningTeam,
  );
  return { success: true, queueEntryIds, entriesById, winnerEntryIds };
}

export async function loadWaitingQueueRows(db: SupabaseClient, eventId: string) {
  const { data: allWaitingRows } = await db
    .from("queue_entries")
    .select("id, user_id, group_size, position")
    .eq("event_id", eventId)
    .eq("status", "waiting")
    .order("position");
  return allWaitingRows || [];
}
