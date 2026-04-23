import {
  serializeAdminCourtAssignments,
  serializeAdminEvent,
  serializeAdminQueueEntries,
  type AdminSerializedCourtAssignment,
  type AdminSerializedEvent,
  type AdminSerializedQueueEntry,
} from "@/lib/admin/hydrate-admin-event-detail";
import {
  ADMIN_COURT_ASSIGNMENTS_SELECT,
  mapAdminCourtAssignmentRows,
  type AdminCourtAssignmentWithPlayers,
} from "@/lib/admin/map-admin-court-assignments";
import {
  adminEventNameIsTestEvent,
  mapAdminEventRowToEvent,
} from "@/lib/admin/map-admin-event-row";
import { fetchAdminQueueEntriesWithClient } from "@/lib/admin-queue";

import type { SupabaseClient } from "@supabase/supabase-js";

async function adminAssignmentsForEvent(
  supabase: SupabaseClient,
  eventId: string,
) {
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

export async function fetchAdminEventDetailPayload(
  supabase: SupabaseClient,
  eventId: string,
): Promise<{
  initialEvent: AdminSerializedEvent;
  initialAssignments: AdminSerializedCourtAssignment[];
  initialQueue: AdminSerializedQueueEntry[];
  isTestEvent: boolean;
} | null> {
  const { data: rawEvent, error: eventError } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();
  if (eventError || !rawEvent) return null;
  const event = mapAdminEventRowToEvent(rawEvent);
  const assignments = await adminAssignmentsForEvent(supabase, eventId);
  const initialQueue = await fetchAdminQueueEntriesWithClient(supabase, eventId);
  return {
    initialEvent: serializeAdminEvent(event),
    initialAssignments: serializeAdminCourtAssignments(assignments),
    initialQueue: serializeAdminQueueEntries(initialQueue),
    isTestEvent: adminEventNameIsTestEvent(event.name),
  };
}
