import type {
  EventDetailSharedSerializedCourtPlayers,
  EventDetailSharedSerializedEventCore,
  EventDetailSharedSerializedUser,
} from "@/lib/events/event-detail-shared-dto";

/** JSON-safe event for Client Component props (member route). */
export type EventDetailSerializedEvent = EventDetailSharedSerializedEventCore & {
  time?: string;
  numCourts?: string;
};

export type EventDetailSerializedUser = EventDetailSharedSerializedUser;

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
} & EventDetailSharedSerializedCourtPlayers;

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

export type {
  EventDetailSharedSerializedCourtPlayers,
  EventDetailSharedSerializedEventCore,
  EventDetailSharedSerializedUser,
} from "@/lib/events/event-detail-shared-dto";

export { loadEventDetailPageData } from "@/lib/events/event-detail-load";
