import { addPlayersToQueue } from "@/lib/queue/algorithm/add-players-to-queue";
import { assignNextPlayers } from "@/lib/queue/algorithm/assign-next-players";
import { createNextAssignment } from "@/lib/queue/algorithm/create-next-assignment";
import { estimateWaitTime } from "@/lib/queue/algorithm/estimate-wait-time";
import { handleGameCompletion } from "@/lib/queue/algorithm/game-completion";
import { getNextPlayers } from "@/lib/queue/algorithm/next-players";
import { reorderQueue } from "@/lib/queue/algorithm/reorder-queue";

import type {
  CourtAssignment,
  QueueEntry,
  RotationType,
  TeamSize,
  User,
} from "@/lib/types";

export class QueueManager {
  static assignNextPlayers(
    queue: QueueEntry[],
    courtCount: number,
    currentAssignments: CourtAssignment[],
    rotationType: RotationType,
    teamSize: TeamSize,
  ): { courtNumber: number; playerIds: string[] }[] {
    return assignNextPlayers(
      queue,
      courtCount,
      currentAssignments,
      rotationType,
      teamSize,
    );
  }

  static getNextPlayers(queue: QueueEntry[], count: number): QueueEntry[] {
    return getNextPlayers(queue, count);
  }

  static reorderQueue(queue: QueueEntry[]): QueueEntry[] {
    return reorderQueue(queue);
  }

  static estimateWaitTime(
    position: number,
    courtCount: number,
    teamSize: TeamSize,
    avgGameMinutes = 15,
  ): number {
    return estimateWaitTime(
      position,
      courtCount,
      teamSize,
      avgGameMinutes,
    );
  }

  static handleGameCompletion(
    assignment: CourtAssignment,
    rotationType: RotationType,
    winningTeam: "team1" | "team2",
    queue: QueueEntry[],
    teamSize: TeamSize,
  ): {
    playersToQueue: string[];
    playersToStay: string[];
  } {
    return handleGameCompletion(
      assignment,
      rotationType,
      winningTeam,
      queue,
      teamSize,
    );
  }

  static createNextAssignment(
    courtNumber: number,
    stayingPlayerIds: string[],
    queue: QueueEntry[],
    eventId: string,
    teamSize: TeamSize,
  ) {
    return createNextAssignment(
      courtNumber,
      stayingPlayerIds,
      queue,
      eventId,
      teamSize,
    );
  }

  static addPlayersToQueue(
    playerIds: string[],
    queue: QueueEntry[],
    eventId: string,
    users: User[],
  ): QueueEntry[] {
    return addPlayersToQueue(playerIds, queue, eventId, users);
  }
}
