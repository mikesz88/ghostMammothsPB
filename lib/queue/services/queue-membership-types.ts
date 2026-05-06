export type QueueNotification = {
  userId: string;
  eventId: string;
  position: number;
  notificationType: "join" | "up-next" | "position-update" | "court-assignment";
  courtNumber?: number;
};

export type FlushQueueNotifications = (notifications: QueueNotification[]) => Promise<void>;

export type MembershipDeps = {
  flushQueueNotifications: FlushQueueNotifications;
};

export type JoinQueueServiceInput = {
  eventId: string;
  userId: string;
  groupSize: number;
  groupId?: string;
  playerNames?: Array<{ name: string; skillLevel: string }>;
  deps: MembershipDeps;
};
