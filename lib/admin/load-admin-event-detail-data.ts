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
import { fetchEventRowById } from "@/lib/events/fetch-event-row-by-id";

import type { Database } from "@/supabase/supa-schema";
import type { SupabaseClient } from "@supabase/supabase-js";

async function adminAssignmentsForEvent(
  supabase: SupabaseClient<Database>,
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
  supabase: SupabaseClient<Database>,
  eventId: string,
): Promise<{
  initialEvent: AdminSerializedEvent;
  initialAssignments: AdminSerializedCourtAssignment[];
  initialQueue: AdminSerializedQueueEntry[];
  isTestEvent: boolean;
} | null> {
  const rawEvent = await fetchEventRowById(supabase, eventId);
  if (!rawEvent) return null;
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
