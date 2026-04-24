import { mapOneCourtAssignmentRow } from "@/lib/events/map-court-assignment-row";

import type { CourtAssignment } from "@/lib/types";

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

/** Map Supabase `court_assignments` rows (+ joined users) to `CourtAssignment[]`. */
export function mapCourtAssignmentRows(
  data: Array<Record<string, unknown>>,
): CourtAssignment[] {
  return data.map(mapOneCourtAssignmentRow);
}
