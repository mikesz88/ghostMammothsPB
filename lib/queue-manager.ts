import type {
  QueueEntry,
  CourtAssignment,
  RotationType,
  User,
  TeamSize,
} from "./types";

export class QueueManager {
  /**
   * Assigns next players from queue to available courts
   */
  static assignNextPlayers(
    queue: QueueEntry[],
    courtCount: number,
    currentAssignments: CourtAssignment[],
    rotationType: RotationType,
    teamSize: TeamSize
  ): { courtNumber: number; playerIds: string[] }[] {
    const availableCourts = this.getAvailableCourts(
      courtCount,
      currentAssignments
    );
    const waitingPlayers = queue
      .filter((entry) => entry.status === "waiting")
      .sort((a, b) => a.position - b.position);
    const playersPerCourt = teamSize * 2;

    const assignments: { courtNumber: number; playerIds: string[] }[] = [];

    for (const courtNumber of availableCourts) {
      const players = this.getNextPlayers(waitingPlayers, playersPerCourt);
      if (players.length === playersPerCourt) {
        assignments.push({
          courtNumber,
          playerIds: players.map((p) => p.userId),
        });
        // Remove assigned players from waiting list
        players.forEach((player) => {
          const index = waitingPlayers.findIndex((p) => p.id === player.id);
          if (index > -1) waitingPlayers.splice(index, 1);
        });
      }
    }

    return assignments;
  }

  /**
   * Gets available court numbers
   */
  private static getAvailableCourts(
    courtCount: number,
    currentAssignments: CourtAssignment[]
  ): number[] {
    const occupiedCourts = new Set(
      currentAssignments.filter((a) => !a.endedAt).map((a) => a.courtNumber)
    );

    const available: number[] = [];
    for (let i = 1; i <= courtCount; i++) {
      if (!occupiedCourts.has(i)) {
        available.push(i);
      }
    }
    return available;
  }

  /**
   * Gets next N players from queue using subset-sum over atomic groups.
   *
   * IMPORTANT: Groups are NEVER split - they are treated as atomic units.
   *
   * Queue order is by ascending `position` (index 0 = front of line). Among all
   * combinations of groups whose sizes sum to exactly `count`, pick the most
   * front-loaded (FIFO):
   * 1) Minimize sum of selected group indices — take from the front of the queue
   *    first (rotate-all: players who just finished are at the back and must not
   *    be chosen ahead of people who were already waiting when both sets fit).
   * 2) Tie: lexicographically smaller sorted index list (earlier groups win).
   */
  static getNextPlayers(queue: QueueEntry[], count: number): QueueEntry[] {
    const groups: QueueEntry[][] = [];
    const processedGroupIds = new Set<string>();

    for (const entry of queue) {
      if (entry.groupId && !processedGroupIds.has(entry.groupId)) {
        const groupMembers = queue.filter((e) => e.groupId === entry.groupId);
        groups.push(groupMembers);
        processedGroupIds.add(entry.groupId);
      } else if (!entry.groupId) {
        groups.push([entry]);
      }
    }

    const countPlayers = (entries: QueueEntry[]): number => {
      return entries.reduce((sum, entry) => sum + (entry.groupSize || 1), 0);
    };

    const groupSizes = groups.map(countPlayers);
    const solutions: number[][] = [];
    this.collectExactCombinations(groupSizes, count, 0, [], 0, solutions);

    if (solutions.length === 0) {
      return [];
    }

    const bestIndices = solutions.reduce((best, cur) =>
      this.isFifoBetterCombination(cur, best) ? cur : best
    );

    return bestIndices.flatMap((idx) => groups[idx]);
  }

  /** DFS: collect every subset of group indices whose sizes sum to `target`. */
  private static collectExactCombinations(
    groupSizes: number[],
    target: number,
    startIdx: number,
    current: number[],
    currentSum: number,
    out: number[][]
  ): void {
    if (currentSum === target) {
      out.push([...current]);
      return;
    }
    if (currentSum > target || startIdx >= groupSizes.length) {
      return;
    }

    this.collectExactCombinations(
      groupSizes,
      target,
      startIdx + 1,
      [...current, startIdx],
      currentSum + groupSizes[startIdx],
      out
    );
    this.collectExactCombinations(
      groupSizes,
      target,
      startIdx + 1,
      current,
      currentSum,
      out
    );
  }

  /** True if `a` is preferred over `b` under FIFO (front-of-queue first) rules. */
  private static isFifoBetterCombination(a: number[], b: number[]): boolean {
    const sumA = a.reduce((s, i) => s + i, 0);
    const sumB = b.reduce((s, i) => s + i, 0);
    if (sumA !== sumB) {
      return sumA < sumB;
    }
    const sa = [...a].sort((x, y) => x - y);
    const sb = [...b].sort((x, y) => x - y);
    const len = Math.max(sa.length, sb.length);
    for (let i = 0; i < len; i++) {
      const va = sa[i];
      const vb = sb[i];
      if (va === undefined) {
        return true;
      }
      if (vb === undefined) {
        return false;
      }
      if (va !== vb) {
        return va < vb;
      }
    }
    return false;
  }

  /**
   * Reorders queue positions after changes
   */
  static reorderQueue(queue: QueueEntry[]): QueueEntry[] {
    return queue
      .filter((entry) => entry.status === "waiting")
      .sort((a, b) => a.position - b.position)
      .map((entry, index) => ({
        ...entry,
        position: index + 1,
      }));
  }

  /**
   * Calculates estimated wait time based on queue position
   */
  static estimateWaitTime(
    position: number,
    courtCount: number,
    teamSize: TeamSize,
    avgGameMinutes = 15
  ): number {
    const playersPerRound = courtCount * teamSize * 2;
    const roundsToWait = Math.ceil(position / playersPerRound);
    return roundsToWait * avgGameMinutes;
  }

  /**
   * Handles game completion based on rotation type
   * Returns updated queue entries and which players should stay on court
   */
  static handleGameCompletion(
    assignment: CourtAssignment,
    rotationType: RotationType,
    winningTeam: "team1" | "team2",
    queue: QueueEntry[],
    teamSize: TeamSize
  ): {
    playersToQueue: string[];
    playersToStay: string[];
  } {
    // Get all player IDs from assignment
    const allPlayerIds = [
      assignment.player1Id,
      assignment.player2Id,
      assignment.player3Id,
      assignment.player4Id,
      assignment.player5Id,
      assignment.player6Id,
      assignment.player7Id,
      assignment.player8Id,
    ].filter(Boolean) as string[];

    // Dynamically split into teams based on teamSize
    // Team1: first N players, Team2: next N players
    const team1 = allPlayerIds.slice(0, teamSize);
    const team2 = allPlayerIds.slice(teamSize, teamSize * 2);

    const winners = winningTeam === "team1" ? team1 : team2;
    const losers = winningTeam === "team1" ? team2 : team1;

    switch (rotationType) {
      case "winners-stay":
        // All winners stay, all losers go to queue
        return {
          playersToStay: winners,
          playersToQueue: losers,
        };

      case "2-stay-2-off":
        // Same as winners-stay for stay/queue split; court placement splits winners next game.
        return {
          playersToStay: winners,
          playersToQueue: losers,
        };

      case "rotate-all":
        // Everyone goes back to queue
        return {
          playersToStay: [],
          playersToQueue: [...team1, ...team2],
        };

      default:
        return {
          playersToStay: [],
          playersToQueue: [...team1, ...team2],
        };
    }
  }

  /**
   * Creates new court assignment with staying players + new players from queue
   */
  static createNextAssignment(
    courtNumber: number,
    stayingPlayerIds: string[],
    queue: QueueEntry[],
    eventId: string,
    teamSize: TeamSize
  ): {
    assignment: Partial<CourtAssignment>;
    assignedQueueEntries: QueueEntry[];
  } | null {
    const playersPerCourt = teamSize * 2;
    const playersNeeded = playersPerCourt - stayingPlayerIds.length;
    const waitingPlayers = queue
      .filter((e) => e.status === "waiting")
      .sort((a, b) => a.position - b.position);

    const newPlayers = this.getNextPlayers(waitingPlayers, playersNeeded);

    if (stayingPlayerIds.length + newPlayers.length < playersPerCourt) {
      // Not enough players to fill the court
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

    // Assign players to slots based on team size
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

  /**
   * Adds players back to queue
   */
  static addPlayersToQueue(
    playerIds: string[],
    queue: QueueEntry[],
    eventId: string,
    users: User[]
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
}
