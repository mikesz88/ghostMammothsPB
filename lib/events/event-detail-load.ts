import {
  serializeEvent,
  serializeEventDetailAssignment,
} from "@/lib/events/event-detail-serialize";
import { fetchEventRowById } from "@/lib/events/fetch-event-row-by-id";
import { fetchOpenCourtAssignmentsForEventDetail } from "@/lib/events/fetch-open-court-assignments-for-event-detail";
import { mapEventRowToEvent } from "@/lib/events/map-event-row";
import { canUserJoinEvent } from "@/lib/membership-helpers";
import { createClient } from "@/lib/supabase/server";

import type {
  EventDetailAccess,
  EventDetailPagePayload,
} from "@/lib/events/event-detail-server";

async function guestAccess(): Promise<{
  initialIsAdmin: boolean;
  initialAccess: EventDetailAccess;
}> {
  return {
    initialIsAdmin: false,
    initialAccess: { canJoin: true, requiresPayment: false },
  };
}

async function userAccess(
  supabase: Awaited<ReturnType<typeof createClient>>,
  user: { id: string },
  eventId: string,
) {
  const { data: profile } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  const access = await canUserJoinEvent(user.id, eventId, supabase);
  return {
    initialIsAdmin: profile?.is_admin ?? false,
    initialAccess: {
      canJoin: access.canJoin,
      joinReason: access.reason,
      requiresPayment: access.requiresPayment,
      paymentAmount: access.amount,
    },
  };
}

async function eventDetailInitialAccess(
  supabase: Awaited<ReturnType<typeof createClient>>,
  user: { id: string } | null,
  eventId: string,
) {
  if (!user) return guestAccess();
  return userAccess(supabase, user, eventId);
}

async function loadEventDetailCore(
  supabase: Awaited<ReturnType<typeof createClient>>,
  eventId: string,
) {
  const rawEvent = await fetchEventRowById(supabase, eventId);
  if (!rawEvent) return null;
  const event = mapEventRowToEvent(
    rawEvent as Parameters<typeof mapEventRowToEvent>[0],
  );
  const assignments = await fetchOpenCourtAssignmentsForEventDetail(
    supabase,
    eventId,
  );
  return { event, assignments };
}

export async function loadEventDetailPageData(
  eventId: string,
): Promise<EventDetailPagePayload | null> {
  const supabase = await createClient();
  const core = await loadEventDetailCore(supabase, eventId);
  if (!core) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { initialIsAdmin, initialAccess } = await eventDetailInitialAccess(
    supabase,
    user,
    eventId,
  );
  return {
    serializedEvent: serializeEvent(core.event),
    initialAssignments: core.assignments.map(serializeEventDetailAssignment),
    initialAccess,
    initialIsAdmin,
  };
}
