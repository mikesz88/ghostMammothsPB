import type { EventStatus, RotationType, TeamSize } from "@/lib/types";

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

export type EventDetailPagePayload = {
  serializedEvent: EventDetailSerializedEvent;
  initialAssignments: EventDetailSerializedAssignment[];
  initialAccess: EventDetailAccess;
  initialIsAdmin: boolean;
};

export { loadEventDetailPageData } from "@/lib/events/event-detail-load";
