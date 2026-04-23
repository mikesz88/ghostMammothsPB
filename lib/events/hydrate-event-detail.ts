import type {
  EventDetailSerializedAssignment,
  EventDetailSerializedEvent,
  EventDetailSerializedUser,
} from "@/lib/events/event-detail-server";
import type { CourtAssignment, Event, User } from "@/lib/types";

function hydrateUser(s: EventDetailSerializedUser): User {
  return {
    id: s.id,
    email: s.email,
    name: s.name,
    skillLevel: s.skillLevel as User["skillLevel"],
    isAdmin: s.isAdmin,
    createdAt: new Date(s.createdAt),
  };
}

export function hydrateSerializedEvent(s: EventDetailSerializedEvent): Event {
  return {
    id: s.id,
    name: s.name,
    location: s.location,
    date: new Date(s.date),
    time: s.time,
    numCourts: s.numCourts,
    courtCount: s.courtCount,
    teamSize: s.teamSize,
    rotationType: s.rotationType,
    status: s.status,
    createdAt: new Date(s.createdAt),
    updatedAt: s.updatedAt ? new Date(s.updatedAt) : undefined,
  };
}

export function hydrateSerializedAssignments(
  rows: EventDetailSerializedAssignment[],
): CourtAssignment[] {
  return rows.map((a) => ({
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
