import { redirect } from "next/navigation";

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
import { createClient } from "@/lib/supabase/server";

export type AdminEventDetailPagePayload = {
  eventId: string;
  initialEvent: AdminSerializedEvent;
  initialAssignments: AdminSerializedCourtAssignment[];
  initialQueue: AdminSerializedQueueEntry[];
  isTestEvent: boolean;
};

export async function loadAdminEventDetailPageData(
  eventId: string,
): Promise<AdminEventDetailPagePayload | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_admin) {
    redirect("/admin");
  }

  const { data: rawEvent, error: eventError } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (eventError || !rawEvent) {
    return null;
  }

  const event = mapAdminEventRowToEvent(rawEvent);

  const { data: rawAssignments, error: assignmentsError } = await supabase
    .from("court_assignments")
    .select(ADMIN_COURT_ASSIGNMENTS_SELECT)
    .eq("event_id", eventId)
    .order("court_number");

  if (assignmentsError) {
    console.error("Error loading court_assignments:", assignmentsError);
  }

  const assignments = rawAssignments
    ? mapAdminCourtAssignmentRows(
        rawAssignments as AdminCourtAssignmentWithPlayers[],
      )
    : [];

  const initialQueue = await fetchAdminQueueEntriesWithClient(
    supabase,
    eventId,
  );

  return {
    eventId,
    initialEvent: serializeAdminEvent(event),
    initialAssignments: serializeAdminCourtAssignments(assignments),
    initialQueue: serializeAdminQueueEntries(initialQueue),
    isTestEvent: adminEventNameIsTestEvent(event.name),
  };
}
