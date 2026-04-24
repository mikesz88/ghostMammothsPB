import {
  ADMIN_COURT_ASSIGNMENTS_SELECT,
  mapAdminCourtAssignmentRows,
  type AdminCourtAssignmentWithPlayers,
} from "@/lib/admin/map-admin-court-assignments";

import type { CourtAssignment } from "@/lib/types";
import type { Database } from "@/supabase/supa-schema";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Admin event detail: all assignments for event, court order (unchanged query + mapping). */
export async function fetchCourtAssignmentsForAdminEventDetail(
  supabase: SupabaseClient<Database>,
  eventId: string,
): Promise<CourtAssignment[]> {
  const { data: rawAssignments, error: assignmentsError } = await supabase
    .from("court_assignments")
    .select(ADMIN_COURT_ASSIGNMENTS_SELECT)
    .eq("event_id", eventId)
    .order("court_number");
  if (assignmentsError) {
    console.error("Error loading court_assignments:", assignmentsError);
  }
  return rawAssignments
    ? mapAdminCourtAssignmentRows(
        rawAssignments as AdminCourtAssignmentWithPlayers[],
      )
    : [];
}
