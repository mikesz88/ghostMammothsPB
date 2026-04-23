import type { CourtAssignment, Event, QueueEntry, User } from "@/lib/types";

export type AdminSerializedEvent = {
  id: string;
  name: string;
  location: string;
  date: string;
  courtCount: number;
  teamSize: Event["teamSize"];
  rotationType: Event["rotationType"];
  status: Event["status"];
  createdAt: string;
  updatedAt?: string;
};

export type AdminSerializedUser = {
  id: string;
  email: string;
  name: string;
  skillLevel: string;
  isAdmin: boolean;
  createdAt: string;
};

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
  player1?: AdminSerializedUser;
  player2?: AdminSerializedUser;
  player3?: AdminSerializedUser;
  player4?: AdminSerializedUser;
  player5?: AdminSerializedUser;
  player6?: AdminSerializedUser;
  player7?: AdminSerializedUser;
  player8?: AdminSerializedUser;
};

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

function serializeUser(u: User): AdminSerializedUser {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    skillLevel: u.skillLevel,
    isAdmin: u.isAdmin,
    createdAt: u.createdAt.toISOString(),
  };
}

export function serializeAdminEvent(e: Event): AdminSerializedEvent {
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

export function serializeAdminCourtAssignments(
  rows: CourtAssignment[],
): AdminSerializedCourtAssignment[] {
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
    queueEntryIds: a.queueEntryIds,
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
  }));
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
    user: e.user ? serializeUser(e.user) : undefined,
  }));
}
