import { getNextPlayers } from "@/lib/queue/algorithm/next-players";

import type { CourtAssignment, QueueEntry, TeamSize } from "@/lib/types";

export function createNextAssignment(
  courtNumber: number,
  stayingPlayerIds: string[],
  queue: QueueEntry[],
  eventId: string,
  teamSize: TeamSize,
):
  | {
      assignment: Partial<CourtAssignment>;
      assignedQueueEntries: QueueEntry[];
    }
  | null {
  const playersPerCourt = teamSize * 2;
  const playersNeeded = playersPerCourt - stayingPlayerIds.length;
  const waitingPlayers = queue
    .filter((e) => e.status === "waiting")
    .sort((a, b) => a.position - b.position);

  const newPlayers = getNextPlayers(waitingPlayers, playersNeeded);

  if (stayingPlayerIds.length + newPlayers.length < playersPerCourt) {
    return null;
  }

  const allPlayerIds = [
    ...stayingPlayerIds,
    ...newPlayers.map((p) => p.userId),
  ];

  const assignment: Partial<CourtAssignment> = {
    eventId,
    courtNumber,
    startedAt: new Date(),
  };

  if (allPlayerIds[0]) assignment.player1Id = allPlayerIds[0];
  if (allPlayerIds[1]) assignment.player2Id = allPlayerIds[1];
  if (allPlayerIds[2]) assignment.player3Id = allPlayerIds[2];
  if (allPlayerIds[3]) assignment.player4Id = allPlayerIds[3];
  if (allPlayerIds[4]) assignment.player5Id = allPlayerIds[4];
  if (allPlayerIds[5]) assignment.player6Id = allPlayerIds[5];
  if (allPlayerIds[6]) assignment.player7Id = allPlayerIds[6];
  if (allPlayerIds[7]) assignment.player8Id = allPlayerIds[7];

  return {
    assignment,
    assignedQueueEntries: newPlayers,
  };
}
