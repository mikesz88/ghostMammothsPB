import type { CourtAssignment, User } from "@/lib/types";

/** Shared Supabase select for `court_assignments` + player users (server + client refetch). */
export const COURT_ASSIGNMENTS_NESTED_SELECT = `
  *,
  player1:users!player1_id(*),
  player2:users!player2_id(*),
  player3:users!player3_id(*),
  player4:users!player4_id(*),
  player5:users!player5_id(*),
  player6:users!player6_id(*),
  player7:users!player7_id(*),
  player8:users!player8_id(*)
`;

function mapPlayer(row: {
  id: string;
  name: string;
  email: string;
  skill_level: string;
}): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    skillLevel: row.skill_level as User["skillLevel"],
    isAdmin: false,
    createdAt: new Date(),
  };
}

/** Map Supabase `court_assignments` rows (+ joined users) to `CourtAssignment[]`. */
export function mapCourtAssignmentRows(
  data: Array<Record<string, unknown>>,
): CourtAssignment[] {
  return data.map((assignment) => ({
    id: assignment.id as string,
    eventId: assignment.event_id as string,
    courtNumber: assignment.court_number as number,
    player1Id: assignment.player1_id as string | undefined,
    player2Id: assignment.player2_id as string | undefined,
    player3Id: assignment.player3_id as string | undefined,
    player4Id: assignment.player4_id as string | undefined,
    player5Id: assignment.player5_id as string | undefined,
    player6Id: assignment.player6_id as string | undefined,
    player7Id: assignment.player7_id as string | undefined,
    player8Id: assignment.player8_id as string | undefined,
    player_names: (assignment.player_names as string[]) || [],
    startedAt: new Date(assignment.started_at as string),
    endedAt: assignment.ended_at
      ? new Date(assignment.ended_at as string)
      : undefined,
    player1: assignment.player1
      ? mapPlayer(
          assignment.player1 as {
            id: string;
            name: string;
            email: string;
            skill_level: string;
          },
        )
      : undefined,
    player2: assignment.player2
      ? mapPlayer(
          assignment.player2 as {
            id: string;
            name: string;
            email: string;
            skill_level: string;
          },
        )
      : undefined,
    player3: assignment.player3
      ? mapPlayer(
          assignment.player3 as {
            id: string;
            name: string;
            email: string;
            skill_level: string;
          },
        )
      : undefined,
    player4: assignment.player4
      ? mapPlayer(
          assignment.player4 as {
            id: string;
            name: string;
            email: string;
            skill_level: string;
          },
        )
      : undefined,
    player5: assignment.player5
      ? mapPlayer(
          assignment.player5 as {
            id: string;
            name: string;
            email: string;
            skill_level: string;
          },
        )
      : undefined,
    player6: assignment.player6
      ? mapPlayer(
          assignment.player6 as {
            id: string;
            name: string;
            email: string;
            skill_level: string;
          },
        )
      : undefined,
    player7: assignment.player7
      ? mapPlayer(
          assignment.player7 as {
            id: string;
            name: string;
            email: string;
            skill_level: string;
          },
        )
      : undefined,
    player8: assignment.player8
      ? mapPlayer(
          assignment.player8 as {
            id: string;
            name: string;
            email: string;
            skill_level: string;
          },
        )
      : undefined,
  }));
}
