import {
  hydrateCourtAssignmentDetailScalars,
  hydrateEventDetailSharedCourtPlayers,
  hydrateEventDetailSharedEventCore,
  hydrateEventDetailSharedUser,
} from "@/lib/events/event-detail-hydrate-shared";
import {
  serializeCourtAssignmentDetailScalars,
  serializeEventDetailSharedCourtPlayers,
  serializeEventDetailSharedEventCore,
  serializeEventDetailSharedUser,
} from "@/lib/events/event-detail-serialize-shared";

import type {
  EventDetailSharedSerializedCourtPlayers,
  EventDetailSharedSerializedEventCore,
  EventDetailSharedSerializedUser,
} from "@/lib/events/event-detail-shared-dto";
import type { CourtAssignment, Event, QueueEntry } from "@/lib/types";

export type AdminSerializedEvent = EventDetailSharedSerializedEventCore;

export type AdminSerializedUser = EventDetailSharedSerializedUser;

export type AdminSerializedCourtAssignment = Omit<
  CourtAssignment,
  | "startedAt"
  | "endedAt"
  | "player1"
  | "player2"
  | "player3"
  | "player4"
  | "player5"
  | "player6"
  | "player7"
  | "player8"
> & {
  startedAt: string;
  endedAt?: string;
} & EventDetailSharedSerializedCourtPlayers;

export type AdminSerializedQueueEntry = Omit<QueueEntry, "joinedAt" | "user"> & {
  joinedAt: string;
  user?: AdminSerializedUser;
};

export function hydrateAdminSerializedEvent(s: AdminSerializedEvent): Event {
  return hydrateEventDetailSharedEventCore(s);
}

export function hydrateAdminSerializedAssignments(
  rows: AdminSerializedCourtAssignment[],
): CourtAssignment[] {
  return rows.map((a) => ({
    ...hydrateCourtAssignmentDetailScalars(a),
    ...hydrateEventDetailSharedCourtPlayers(a),
  }));
}

export function hydrateAdminSerializedQueue(
  rows: AdminSerializedQueueEntry[],
): QueueEntry[] {
  return rows.map((e) => ({
    ...e,
    joinedAt: new Date(e.joinedAt),
    user: e.user ? hydrateEventDetailSharedUser(e.user) : undefined,
  }));
}

export function serializeAdminEvent(e: Event): AdminSerializedEvent {
  return serializeEventDetailSharedEventCore(e);
}

function serializeAdminCourtAssignmentRow(
  a: CourtAssignment,
): AdminSerializedCourtAssignment {
  return {
    ...serializeCourtAssignmentDetailScalars(a),
    queueEntryIds: a.queueEntryIds,
    ...serializeEventDetailSharedCourtPlayers(a),
  };
}

export function serializeAdminCourtAssignments(
  rows: CourtAssignment[],
): AdminSerializedCourtAssignment[] {
  return rows.map(serializeAdminCourtAssignmentRow);
}

export function serializeAdminQueueEntries(
  rows: QueueEntry[],
): AdminSerializedQueueEntry[] {
  return rows.map((e) => ({
    id: e.id,
    eventId: e.eventId,
    userId: e.userId,
    groupId: e.groupId,
    groupSize: e.groupSize,
    player_names: e.player_names,
    position: e.position,
    status: e.status,
    joinedAt: e.joinedAt.toISOString(),
    user: e.user ? serializeEventDetailSharedUser(e.user) : undefined,
  }));
}
