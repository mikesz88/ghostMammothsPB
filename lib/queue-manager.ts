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
   * Gets next N players from queue using optimal subset sum algorithm
   * Finds best combination of groups that fills exactly 'count' players
   * Prioritizes: 1) Exact match, 2) Fewer groups, 3) Earlier positions
   *
   * IMPORTANT: Groups are NEVER split - they are treated as atomic units.
   * A group of 3 players will always be taken together or skipped entirely.
   */
  static getNextPlayers(queue: QueueEntry[], count: number): QueueEntry[] {
    // Group entries by their group_id or as solo players
    // Each group is treated as an atomic unit that cannot be split
    const groups: QueueEntry[][] = [];
    const processedGroupIds = new Set<string>();

    for (const entry of queue) {
      if (entry.groupId && !processedGroupIds.has(entry.groupId)) {
        const groupMembers = queue.filter((e) => e.groupId === entry.groupId);
        groups.push(groupMembers);
        processedGroupIds.add(entry.groupId);
      } else if (!entry.groupId) {
        groups.push([entry]); // Solo player as single-member group
      }
    }

    // Helper to count total players in a group
    const countPlayers = (entries: QueueEntry[]): number => {
      return entries.reduce((sum, entry) => sum + (entry.groupSize || 1), 0);
    };

    // Calculate player counts for each group
    const groupSizes = groups.map(countPlayers);

    // Find best combination using backtracking
    const bestIndices = this.findBestCombination(groupSizes, count, 0, [], 0);

    if (bestIndices && bestIndices.length > 0) {
      // Flatten selected groups into individual entries
      return bestIndices.flatMap((idx) => groups[idx]);
    }

    // Fallback: return empty if no valid combination found
    return [];
  }

  /**
   * Backtracking algorithm to find best subset of groups that sum to target
   * Returns indices of groups that should be selected
   * Prioritizes: 1) Exact match, 2) Fewer groups, 3) Earlier positions (lower indices)
   */
  private static findBestCombination(
    groupSizes: number[],
    target: number,
    startIdx: number,
    currentCombination: number[],
    currentSum: number,
    bestExact: number[] | null = null
  ): number[] | null {
    // Perfect match found
    if (currentSum === target) {
      if (!bestExact) {
        return [...currentCombination];
      }
      // Prefer fewer groups, or if same length, prefer earlier positions
      if (currentCombination.length < bestExact.length) {
        return [...currentCombination];
      }
      if (currentCombination.length === bestExact.length) {
        // Same number of groups - prefer the one with lower sum of indices (closer to top)
        const currentIndexSum = currentCombination.reduce((a, b) => a + b, 0);
        const bestIndexSum = bestExact.reduce((a, b) => a + b, 0);
        if (currentIndexSum < bestIndexSum) {
          return [...currentCombination];
        }
      }
      return bestExact;
    }

    // Exceeded target or reached end without exact match
    if (currentSum > target || startIdx >= groupSizes.length) {
      return bestExact;
    }

    // Try including current group (explores "take early groups" path first)
    const withCurrent = this.findBestCombination(
      groupSizes,
      target,
      startIdx + 1,
      [...currentCombination, startIdx],
      currentSum + groupSizes[startIdx],
      bestExact
    );

    // If we found exact match with current, update bestExact
    const updatedBest = withCurrent || bestExact;

    // Try skipping current group
    const withoutCurrent = this.findBestCombination(
      groupSizes,
      target,
      startIdx + 1,
      currentCombination,
      currentSum,
      updatedBest
    );

    // Return best result
    if (withCurrent && withoutCurrent) {
      // Prefer fewer groups
      if (withCurrent.length !== withoutCurrent.length) {
        return withCurrent.length < withoutCurrent.length
          ? withCurrent
          : withoutCurrent;
      }
      // Same length - prefer earlier positions (lower sum of indices)
      const currentIndexSum = withCurrent.reduce((a, b) => a + b, 0);
      const withoutIndexSum = withoutCurrent.reduce((a, b) => a + b, 0);
      return currentIndexSum <= withoutIndexSum ? withCurrent : withoutCurrent;
    }

    return withCurrent || withoutCurrent;
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
      case "2-stay-4-off":
        // Winners stay, losers go to back of queue
        return {
          playersToStay: winners,
          playersToQueue: losers,
        };

      case "winners-stay":
        // All winners stay, all losers go to queue
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
