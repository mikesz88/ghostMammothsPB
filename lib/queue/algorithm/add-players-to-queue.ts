import type { QueueEntry, User } from "@/lib/types";

export function addPlayersToQueue(
  playerIds: string[],
  queue: QueueEntry[],
  eventId: string,
  users: User[],
): QueueEntry[] {
  const maxPosition = Math.max(0, ...queue.map((e) => e.position));

  const newEntries: QueueEntry[] = playerIds.map((playerId, index) => {
    const user = users.find((u) => u.id === playerId);
    return {
      id: Math.random().toString(),
      eventId,
      userId: playerId,
      groupSize: 1,
      position: maxPosition + index + 1,
      status: "waiting" as const,
      joinedAt: new Date(),
      user,
    };
  });

  return [...queue, ...newEntries];
}
