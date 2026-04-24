import {
  COURT_ASSIGNMENTS_NESTED_SELECT,
  mapCourtAssignmentRows,
} from "@/lib/events/map-court-assignments";

import type { CourtAssignment } from "@/lib/types";
import type { Database } from "@/supabase/supa-schema";
import type { SupabaseClient } from "@supabase/supabase-js";

/** Member event detail: open assignments only (unchanged query + mapping). */
export async function fetchOpenCourtAssignmentsForEventDetail(
  supabase: SupabaseClient<Database>,
  eventId: string,
): Promise<CourtAssignment[]> {
  const { data: rawAssignments, error: assignError } = await supabase
    .from("court_assignments")
    .select(COURT_ASSIGNMENTS_NESTED_SELECT)
    .eq("event_id", eventId)
    .is("ended_at", null);
  return assignError
    ? []
    : mapCourtAssignmentRows((rawAssignments ?? []) as Record<string, unknown>[]);
}
