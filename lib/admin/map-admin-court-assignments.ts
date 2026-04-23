import type { CourtAssignment, SkillLevel } from "@/lib/types";
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

function mapPlayer(
  row: {
    id: string;
    name: string;
    email: string;
    skill_level: string;
  } | null,
): CourtAssignment["player1"] {
  if (!row) return undefined;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    skillLevel: row.skill_level as SkillLevel,
    isAdmin: false,
    createdAt: new Date(),
  };
}

export function mapAdminCourtAssignmentRows(
  data: AdminCourtAssignmentWithPlayers[],
): CourtAssignment[] {
  return data.map((assignment) => {
    let playerNamesArray: string[] = [];
    let queueEntryIdsArray: string[] = [];

    if (assignment.player_names) {
      try {
        const parsed = assignment.player_names as unknown as string[];
        playerNamesArray = Array.isArray(parsed) ? parsed : [];
      } catch {
        playerNamesArray = [];
      }
    }

    if (assignment.queue_entry_ids) {
      try {
        const parsed = assignment.queue_entry_ids as unknown as string[];
        queueEntryIdsArray = Array.isArray(parsed) ? parsed : [];
      } catch {
        queueEntryIdsArray = [];
      }
    }

    return {
      id: assignment.id,
      eventId: assignment.event_id || "",
      courtNumber: assignment.court_number,
      player1Id: assignment.player1_id || undefined,
      player2Id: assignment.player2_id || undefined,
      player3Id: assignment.player3_id || undefined,
      player4Id: assignment.player4_id || undefined,
      player5Id: assignment.player5_id || undefined,
      player6Id: assignment.player6_id || undefined,
      player7Id: assignment.player7_id || undefined,
      player8Id: assignment.player8_id || undefined,
      player_names: playerNamesArray,
      queueEntryIds: queueEntryIdsArray,
      startedAt: new Date(assignment.started_at || ""),
      endedAt: assignment.ended_at
        ? new Date(assignment.ended_at)
        : undefined,
      player1: mapPlayer(assignment.player1),
      player2: mapPlayer(assignment.player2),
      player3: mapPlayer(assignment.player3),
      player4: mapPlayer(assignment.player4),
      player5: mapPlayer(assignment.player5),
      player6: mapPlayer(assignment.player6),
      player7: mapPlayer(assignment.player7),
      player8: mapPlayer(assignment.player8),
    };
  });
}
