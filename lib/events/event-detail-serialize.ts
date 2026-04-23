import type {
  EventDetailSerializedAssignment,
  EventDetailSerializedEvent,
  EventDetailSerializedUser,
} from "@/lib/events/event-detail-server";
import type { CourtAssignment, Event } from "@/lib/types";

function serializeAssignmentUser(u: {
  id: string;
  email: string;
  name: string;
  skillLevel: string;
  isAdmin: boolean;
  createdAt: Date;
}): EventDetailSerializedUser {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    skillLevel: u.skillLevel,
    isAdmin: u.isAdmin,
    createdAt: u.createdAt.toISOString(),
  };
}

function serializedAssignmentPlayers(a: CourtAssignment) {
  return {
    player1: a.player1 ? serializeAssignmentUser(a.player1) : undefined,
    player2: a.player2 ? serializeAssignmentUser(a.player2) : undefined,
    player3: a.player3 ? serializeAssignmentUser(a.player3) : undefined,
    player4: a.player4 ? serializeAssignmentUser(a.player4) : undefined,
    player5: a.player5 ? serializeAssignmentUser(a.player5) : undefined,
    player6: a.player6 ? serializeAssignmentUser(a.player6) : undefined,
    player7: a.player7 ? serializeAssignmentUser(a.player7) : undefined,
    player8: a.player8 ? serializeAssignmentUser(a.player8) : undefined,
  };
}

export function serializeEventDetailAssignment(
  a: CourtAssignment,
): EventDetailSerializedAssignment {
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
    ...serializedAssignmentPlayers(a),
  };
}

export function serializeEvent(e: Event): EventDetailSerializedEvent {
  return {
    id: e.id,
    name: e.name,
    location: e.location,
    date: e.date.toISOString(),
    time: e.time,
    numCourts: e.numCourts,
    courtCount: e.courtCount,
    teamSize: e.teamSize,
    rotationType: e.rotationType,
    status: e.status,
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt?.toISOString(),
  };
}
