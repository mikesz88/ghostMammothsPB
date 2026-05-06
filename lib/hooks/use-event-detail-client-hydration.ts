"use client";

import { useMemo } from "react";

import { hydrateSerializedEvent } from "@/lib/events/hydrate-event-detail";
import { useCourtAssignmentsRealtime } from "@/lib/hooks/use-court-assignments-realtime";

import type { EventDetailSerializedAssignment, EventDetailSerializedEvent } from "@/lib/events/event-detail-server";

export function useEventDetailClientHydration(
  eventId: string,
  initialEvent: EventDetailSerializedEvent,
  initialAssignments: EventDetailSerializedAssignment[],
) {
  const event = useMemo(
    () => hydrateSerializedEvent(initialEvent),
    [initialEvent],
  );
  const assignments = useCourtAssignmentsRealtime(eventId, initialAssignments);
  return { event, assignments };
}
