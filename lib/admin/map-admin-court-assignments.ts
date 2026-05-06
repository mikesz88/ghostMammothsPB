import {
  COURT_ASSIGNMENT_PLAYER_SLOTS,
  type CourtAssignmentPlayerSlot,
} from "@/lib/events/court-assignment-player-slots";
import { mapPlayer } from "@/lib/events/map-court-assignments-shared";

import type { CourtAssignment } from "@/lib/types";
import type { Database } from "@/supabase/supa-schema";

type CourtAssignmentRow =
  Database["public"]["Tables"]["court_assignments"]["Row"];

export type AdminCourtAssignmentWithPlayers = CourtAssignmentRow & {
  player_names?: unknown;
  queue_entry_ids?: unknown;
  player1: {
    id: string;
    name: string;
    email: string;
    skill_level: string;
  } | null;
  player2: {
    id: string;
    name: string;
    email: string;
    skill_level: string;
  } | null;
  player3: {
    id: string;
    name: string;
    email: string;
    skill_level: string;
  } | null;
  player4: {
    id: string;
    name: string;
    email: string;
    skill_level: string;
  } | null;
  player5: {
    id: string;
    name: string;
    email: string;
    skill_level: string;
  } | null;
  player6: {
    id: string;
    name: string;
    email: string;
    skill_level: string;
  } | null;
  player7: {
    id: string;
    name: string;
    email: string;
    skill_level: string;
  } | null;
  player8: {
    id: string;
    name: string;
    email: string;
    skill_level: string;
  } | null;
};

/** Same nested select as the former client admin event page. */
export const ADMIN_COURT_ASSIGNMENTS_SELECT = `
  *,
  player1:users!court_assignments_player1_id_fkey(id, name, email, skill_level),
  player2:users!court_assignments_player2_id_fkey(id, name, email, skill_level),
  player3:users!court_assignments_player3_id_fkey(id, name, email, skill_level),
  player4:users!court_assignments_player4_id_fkey(id, name, email, skill_level),
  player5:users!court_assignments_player5_id_fkey(id, name, email, skill_level),
  player6:users!court_assignments_player6_id_fkey(id, name, email, skill_level),
  player7:users!court_assignments_player7_id_fkey(id, name, email, skill_level),
  player8:users!court_assignments_player8_id_fkey(id, name, email, skill_level)
`;

function parseStringArrayField(raw: unknown): string[] {
  if (!raw) return [];
  try {
    const parsed = raw as unknown as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function adminCourtPlayerIdFields(row: AdminCourtAssignmentWithPlayers) {
  return {
    player1Id: row.player1_id || undefined,
    player2Id: row.player2_id || undefined,
    player3Id: row.player3_id || undefined,
    player4Id: row.player4_id || undefined,
    player5Id: row.player5_id || undefined,
    player6Id: row.player6_id || undefined,
    player7Id: row.player7_id || undefined,
    player8Id: row.player8_id || undefined,
  };
}

function mapAdminCourtPlayerCells(row: AdminCourtAssignmentWithPlayers) {
  return Object.fromEntries(
    COURT_ASSIGNMENT_PLAYER_SLOTS.map((key) => {
      const cell = row[key as CourtAssignmentPlayerSlot];
      return [key, cell ? mapPlayer(cell) : undefined];
    }),
  ) as Pick<CourtAssignment, CourtAssignmentPlayerSlot>;
}

function buildAdminAssignmentScalars(
  assignment: AdminCourtAssignmentWithPlayers,
) {
  const names = parseStringArrayField(assignment.player_names);
  const qIds = parseStringArrayField(assignment.queue_entry_ids);
  return {
    id: assignment.id,
    eventId: assignment.event_id || "",
    courtNumber: assignment.court_number,
    ...adminCourtPlayerIdFields(assignment),
    player_names: names,
    queueEntryIds: qIds,
    startedAt: new Date(assignment.started_at || ""),
    endedAt: assignment.ended_at ? new Date(assignment.ended_at) : undefined,
  };
}

function mapOneAdminCourtAssignment(
  assignment: AdminCourtAssignmentWithPlayers,
): CourtAssignment {
  return {
    ...buildAdminAssignmentScalars(assignment),
    ...mapAdminCourtPlayerCells(assignment),
  };
}

export function mapAdminCourtAssignmentRows(
  data: AdminCourtAssignmentWithPlayers[],
): CourtAssignment[] {
  return data.map(mapOneAdminCourtAssignment);
}
