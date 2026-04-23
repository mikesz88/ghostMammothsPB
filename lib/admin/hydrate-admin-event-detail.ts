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
import type { CourtAssignment, Event, QueueEntry, User } from "@/lib/types";

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

function hydrateUser(s: AdminSerializedUser): User {
  return {
    id: s.id,
    email: s.email,
    name: s.name,
    skillLevel: s.skillLevel as User["skillLevel"],
    isAdmin: s.isAdmin,
    createdAt: new Date(s.createdAt),
  };
}

export function hydrateAdminSerializedEvent(s: AdminSerializedEvent): Event {
  return {
    id: s.id,
    name: s.name,
    location: s.location,
    date: new Date(s.date),
    courtCount: s.courtCount,
    teamSize: s.teamSize,
    rotationType: s.rotationType,
    status: s.status,
    createdAt: new Date(s.createdAt),
    updatedAt: s.updatedAt ? new Date(s.updatedAt) : undefined,
  };
}

export function hydrateAdminSerializedAssignments(
  rows: AdminSerializedCourtAssignment[],
): CourtAssignment[] {
  return rows.map((a) => ({
    ...a,
    startedAt: new Date(a.startedAt),
    endedAt: a.endedAt ? new Date(a.endedAt) : undefined,
    player1: a.player1 ? hydrateUser(a.player1) : undefined,
    player2: a.player2 ? hydrateUser(a.player2) : undefined,
    player3: a.player3 ? hydrateUser(a.player3) : undefined,
    player4: a.player4 ? hydrateUser(a.player4) : undefined,
    player5: a.player5 ? hydrateUser(a.player5) : undefined,
    player6: a.player6 ? hydrateUser(a.player6) : undefined,
    player7: a.player7 ? hydrateUser(a.player7) : undefined,
    player8: a.player8 ? hydrateUser(a.player8) : undefined,
  }));
}

export function hydrateAdminSerializedQueue(
  rows: AdminSerializedQueueEntry[],
): QueueEntry[] {
  return rows.map((e) => ({
    ...e,
    joinedAt: new Date(e.joinedAt),
    user: e.user ? hydrateUser(e.user) : undefined,
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
