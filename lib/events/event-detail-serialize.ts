import {
  serializeCourtAssignmentDetailScalars,
  serializeEventDetailSharedCourtPlayers,
  serializeEventDetailSharedEventCore,
} from "@/lib/events/event-detail-serialize-shared";

import type {
  EventDetailSerializedAssignment,
  EventDetailSerializedEvent,
} from "@/lib/events/event-detail-server";
import type { CourtAssignment, Event } from "@/lib/types";

export function serializeEventDetailAssignment(
  a: CourtAssignment,
): EventDetailSerializedAssignment {
  return {
    ...serializeCourtAssignmentDetailScalars(a),
    ...serializeEventDetailSharedCourtPlayers(a),
  };
}

export function serializeEvent(e: Event): EventDetailSerializedEvent {
  return {
    ...serializeEventDetailSharedEventCore(e),
    time: e.time,
    numCourts: e.numCourts,
  };
}
