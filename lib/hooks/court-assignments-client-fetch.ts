import {
  COURT_ASSIGNMENTS_NESTED_SELECT,
  mapCourtAssignmentRows,
} from "@/lib/events/map-court-assignments";

import type { CourtAssignment } from "@/lib/types";
import type { Database } from "@/supabase/supa-schema";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function fetchActiveCourtAssignmentsClient(
  supabase: SupabaseClient<Database>,
  eventId: string,
): Promise<CourtAssignment[]> {
  const { data, error } = await supabase
    .from("court_assignments")
    .select(COURT_ASSIGNMENTS_NESTED_SELECT)
    .eq("event_id", eventId)
    .is("ended_at", null);

  if (error) {
    console.error("Error fetching assignments:", error);
    return [];
  }
  if (!data) return [];
  return mapCourtAssignmentRows(data as Record<string, unknown>[]);
}
