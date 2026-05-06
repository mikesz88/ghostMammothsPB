import { fetchCourtAssignmentsForAdminEventDetail } from "@/lib/admin/fetch-court-assignments-for-admin-event-detail";
import {
  serializeAdminCourtAssignments,
  serializeAdminEvent,
  serializeAdminQueueEntries,
  type AdminSerializedCourtAssignment,
  type AdminSerializedEvent,
  type AdminSerializedQueueEntry,
} from "@/lib/admin/hydrate-admin-event-detail";
import {
  adminEventNameIsTestEvent,
  mapAdminEventRowToEvent,
} from "@/lib/admin/map-admin-event-row";
import { fetchAdminQueueEntriesWithClient } from "@/lib/admin-queue";
import { fetchEventRowById } from "@/lib/events/fetch-event-row-by-id";

import type { Database } from "@/supabase/supa-schema";
import type { SupabaseClient } from "@supabase/supabase-js";

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
  const assignments = await fetchCourtAssignmentsForAdminEventDetail(
    supabase,
    eventId,
  );
  const initialQueue = await fetchAdminQueueEntriesWithClient(supabase, eventId);
  return {
    initialEvent: serializeAdminEvent(event),
    initialAssignments: serializeAdminCourtAssignments(assignments),
    initialQueue: serializeAdminQueueEntries(initialQueue),
    isTestEvent: adminEventNameIsTestEvent(event.name),
  };
}
