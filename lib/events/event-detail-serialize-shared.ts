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

/** Shared user → wire snapshot (member + admin assignment/queue serialization). */
export function serializeEventDetailSharedUser(
  u: User,
): EventDetailSharedSerializedUser {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    skillLevel: u.skillLevel,
    isAdmin: u.isAdmin,
    createdAt: u.createdAt.toISOString(),
  };
}

/** Shared event core → wire (admin full event; member extends with time/numCourts). */
export function serializeEventDetailSharedEventCore(
  e: Event,
): EventDetailSharedSerializedEventCore {
  return {
    id: e.id,
    name: e.name,
    location: e.location,
    date: e.date.toISOString(),
    courtCount: e.courtCount,
    teamSize: e.teamSize,
    rotationType: e.rotationType,
    status: e.status,
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt?.toISOString(),
  };
}

/** Shared nested players for a court assignment row. */
export function serializeEventDetailSharedCourtPlayers(
  a: CourtAssignment,
): EventDetailSharedSerializedCourtPlayers {
  return Object.fromEntries(
    COURT_ASSIGNMENT_PLAYER_SLOTS.map((key) => {
      const u = a[key as CourtAssignmentPlayerSlot];
      return [key, u ? serializeEventDetailSharedUser(u) : undefined];
    }),
  ) as EventDetailSharedSerializedCourtPlayers;
}

/** Scalar fields shared by member and admin serialized court assignments (ISO dates). */
export function serializeCourtAssignmentDetailScalars(a: CourtAssignment) {
  return {
    id: a.id,
    eventId: a.eventId,
    courtNumber: a.courtNumber,
    player1Id: a.player1Id,
    player2Id: a.player2Id,
    player3Id: a.player3Id,
    player4Id: a.player4Id,
    player5Id: a.player5Id,
    player6Id: a.player6Id,
    player7Id: a.player7Id,
    player8Id: a.player8Id,
    player_names: a.player_names,
    startedAt: a.startedAt.toISOString(),
    endedAt: a.endedAt?.toISOString(),
  };
}
