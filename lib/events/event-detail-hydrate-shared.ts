import {
  COURT_ASSIGNMENT_PLAYER_SLOTS,
  type CourtAssignmentPlayerSlot,
} from "@/lib/events/court-assignment-player-slots";

import type {
  EventDetailSharedSerializedCourtPlayers,
  EventDetailSharedSerializedEventCore,
  EventDetailSharedSerializedUser,
} from "@/lib/events/event-detail-shared-dto";
import type { CourtAssignment, Event, User } from "@/lib/types";

/** Wire user snapshot → domain `User` (member + admin hydrate paths). */
export function hydrateEventDetailSharedUser(
  s: EventDetailSharedSerializedUser,
): User {
  return {
    id: s.id,
    email: s.email,
    name: s.name,
    skillLevel: s.skillLevel as User["skillLevel"],
    isAdmin: s.isAdmin,
    createdAt: new Date(s.createdAt),
  };
}

/** Shared event core wire → domain `Event` (admin full row; member adds time/numCourts). */
export function hydrateEventDetailSharedEventCore(
  s: EventDetailSharedSerializedEventCore,
): Event {
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

/** Nested serialized players → domain player slots on `CourtAssignment`. */
export function hydrateEventDetailSharedCourtPlayers(
  a: EventDetailSharedSerializedCourtPlayers,
): Pick<CourtAssignment, CourtAssignmentPlayerSlot> {
  return Object.fromEntries(
    COURT_ASSIGNMENT_PLAYER_SLOTS.map((key) => {
      const cell = a[key];
      return [key, cell ? hydrateEventDetailSharedUser(cell) : undefined];
    }),
  ) as Pick<CourtAssignment, CourtAssignmentPlayerSlot>;
}

/** Assignment row scalars on the wire (ISO `startedAt` / optional `endedAt`). */
export type CourtAssignmentDetailWireScalars = {
  id: string;
  eventId: string;
  courtNumber: number;
  player1Id?: string;
  player2Id?: string;
  player3Id?: string;
  player4Id?: string;
  player5Id?: string;
  player6Id?: string;
  player7Id?: string;
  player8Id?: string;
  player_names?: string[];
  queueEntryIds?: string[];
  startedAt: string;
  endedAt?: string;
};

type CourtAssignmentDetailDomainScalars = Pick<
  CourtAssignment,
  | "id"
  | "eventId"
  | "courtNumber"
  | "player1Id"
  | "player2Id"
  | "player3Id"
  | "player4Id"
  | "player5Id"
  | "player6Id"
  | "player7Id"
  | "player8Id"
  | "player_names"
  | "queueEntryIds"
  | "startedAt"
  | "endedAt"
>;

/** Scalar assignment wire → domain ids + `Date` fields (before nested player hydrate). */
export function hydrateCourtAssignmentDetailScalars(
  a: CourtAssignmentDetailWireScalars,
): CourtAssignmentDetailDomainScalars {
  const { startedAt, endedAt, ...rest } = a;
  return {
    ...rest,
    startedAt: new Date(startedAt),
    endedAt: endedAt ? new Date(endedAt) : undefined,
  };
}
