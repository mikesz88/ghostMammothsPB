import { getAvailableCourts } from "@/lib/queue/algorithm/courts";
import { getNextPlayers } from "@/lib/queue/algorithm/next-players";

import type {
  CourtAssignment,
  QueueEntry,
  RotationType,
  TeamSize,
} from "@/lib/types";

export function assignNextPlayers(
  queue: QueueEntry[],
  courtCount: number,
  currentAssignments: CourtAssignment[],
  _rotationType: RotationType,
  teamSize: TeamSize,
): { courtNumber: number; playerIds: string[] }[] {
  const availableCourts = getAvailableCourts(courtCount, currentAssignments);
  const waitingPlayers = queue
    .filter((entry) => entry.status === "waiting")
    .sort((a, b) => a.position - b.position);
  const playersPerCourt = teamSize * 2;

  const assignments: { courtNumber: number; playerIds: string[] }[] = [];

  for (const courtNumber of availableCourts) {
    const players = getNextPlayers(waitingPlayers, playersPerCourt);
    if (players.length === playersPerCourt) {
      assignments.push({
        courtNumber,
        playerIds: players.map((p) => p.userId),
      });
      players.forEach((player) => {
        const index = waitingPlayers.findIndex((p) => p.id === player.id);
        if (index > -1) waitingPlayers.splice(index, 1);
      });
    }
  }

  return assignments;
}
