import {
  hydrateCourtAssignmentDetailScalars,
  hydrateEventDetailSharedCourtPlayers,
  hydrateEventDetailSharedEventCore,
} from "@/lib/events/event-detail-hydrate-shared";

import type {
  EventDetailSerializedAssignment,
  EventDetailSerializedEvent,
} from "@/lib/events/event-detail-server";
import type { CourtAssignment, Event } from "@/lib/types";

export function hydrateSerializedEvent(s: EventDetailSerializedEvent): Event {
  return {
    ...hydrateEventDetailSharedEventCore(s),
    time: s.time,
    numCourts: s.numCourts,
  };
}

function hydrateSerializedAssignmentRow(
  a: EventDetailSerializedAssignment,
): CourtAssignment {
  return {
    ...hydrateCourtAssignmentDetailScalars(a),
    ...hydrateEventDetailSharedCourtPlayers(a),
  };
}

export function hydrateSerializedAssignments(
  rows: EventDetailSerializedAssignment[],
): CourtAssignment[] {
  return rows.map(hydrateSerializedAssignmentRow);
}
