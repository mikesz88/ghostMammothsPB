import {
  COURT_ASSIGNMENTS_NESTED_SELECT,
  mapCourtAssignmentRows,
} from "@/lib/events/map-court-assignments";
import { mapEventRowToEvent } from "@/lib/events/map-event-row";
import { canUserJoinEvent } from "@/lib/membership-helpers";
import { createClient } from "@/lib/supabase/server";

import type { CourtAssignment, Event, EventStatus, RotationType, TeamSize } from "@/lib/types";

/** JSON-safe event for Client Component props. */
export type EventDetailSerializedEvent = {
  id: string;
  name: string;
  location: string;
  date: string;
  time?: string;
  numCourts?: string;
  courtCount: number;
  teamSize: TeamSize;
  rotationType: RotationType;
  status: EventStatus;
  createdAt: string;
  updatedAt?: string;
};

export type EventDetailSerializedUser = {
  id: string;
  email: string;
  name: string;
  skillLevel: string;
  isAdmin: boolean;
  createdAt: string;
};

export type EventDetailSerializedAssignment = {
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
  startedAt: string;
  endedAt?: string;
  player1?: EventDetailSerializedUser;
  player2?: EventDetailSerializedUser;
  player3?: EventDetailSerializedUser;
  player4?: EventDetailSerializedUser;
  player5?: EventDetailSerializedUser;
  player6?: EventDetailSerializedUser;
  player7?: EventDetailSerializedUser;
  player8?: EventDetailSerializedUser;
};

export type EventDetailAccess = {
  canJoin: boolean;
  joinReason?: string;
  requiresPayment: boolean;
  paymentAmount?: number;
};

function serializeUser(u: {
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

function serializeAssignment(a: CourtAssignment): EventDetailSerializedAssignment {
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
    player1: a.player1 ? serializeUser(a.player1) : undefined,
    player2: a.player2 ? serializeUser(a.player2) : undefined,
    player3: a.player3 ? serializeUser(a.player3) : undefined,
    player4: a.player4 ? serializeUser(a.player4) : undefined,
    player5: a.player5 ? serializeUser(a.player5) : undefined,
    player6: a.player6 ? serializeUser(a.player6) : undefined,
    player7: a.player7 ? serializeUser(a.player7) : undefined,
    player8: a.player8 ? serializeUser(a.player8) : undefined,
  };
}

function serializeEvent(e: Event): EventDetailSerializedEvent {
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

export type EventDetailPagePayload = {
  serializedEvent: EventDetailSerializedEvent;
  initialAssignments: EventDetailSerializedAssignment[];
  initialAccess: EventDetailAccess;
  initialIsAdmin: boolean;
};

export async function loadEventDetailPageData(
  eventId: string,
): Promise<EventDetailPagePayload | null> {
  const supabase = await createClient();

  const { data: rawEvent, error: eventError } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (eventError || !rawEvent) {
    return null;
  }

  const event = mapEventRowToEvent(
    rawEvent as Parameters<typeof mapEventRowToEvent>[0],
  );

  const { data: rawAssignments, error: assignError } = await supabase
    .from("court_assignments")
    .select(COURT_ASSIGNMENTS_NESTED_SELECT)
    .eq("event_id", eventId)
    .is("ended_at", null);

  const assignments: CourtAssignment[] = assignError
    ? []
    : mapCourtAssignmentRows((rawAssignments ?? []) as Record<string, unknown>[]);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialIsAdmin = false;
  let initialAccess: EventDetailAccess = {
    canJoin: true,
    requiresPayment: false,
  };

  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    initialIsAdmin = profile?.is_admin ?? false;

    const access = await canUserJoinEvent(user.id, eventId, supabase);
    initialAccess = {
      canJoin: access.canJoin,
      joinReason: access.reason,
      requiresPayment: access.requiresPayment,
      paymentAmount: access.amount,
    };
  }

  return {
    serializedEvent: serializeEvent(event),
    initialAssignments: assignments.map(serializeAssignment),
    initialAccess,
    initialIsAdmin,
  };
}
