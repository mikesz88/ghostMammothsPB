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
   * Gets next N players from queue, respecting groups
   * Counts actual player count using group_size field
   */
  static getNextPlayers(queue: QueueEntry[], count: number): QueueEntry[] {
    const selected: QueueEntry[] = [];
    const processedGroups = new Set<string>();
    const skippedGroups: QueueEntry[][] = [];

    // Helper to count total players (considering group_size)
    const countPlayers = (entries: QueueEntry[]): number => {
      return entries.reduce((sum, entry) => sum + (entry.groupSize || 1), 0);
    };

    let currentPlayerCount = 0;

    // First pass: try to fill with groups and solo players in order
    for (const entry of queue) {
      if (currentPlayerCount >= count) break;

      if (entry.groupId && !processedGroups.has(entry.groupId)) {
        const groupMembers = queue.filter((e) => e.groupId === entry.groupId);
        const groupPlayerCount = countPlayers(groupMembers);

        if (currentPlayerCount + groupPlayerCount <= count) {
          // Group fits, add it
          selected.push(...groupMembers);
          currentPlayerCount += groupPlayerCount;
          processedGroups.add(entry.groupId);
        } else {
          // Group doesn't fit, skip for now
          skippedGroups.push(groupMembers);
          processedGroups.add(entry.groupId);
        }
      } else if (!entry.groupId) {
        // Solo player, add if space
        const playerCount = entry.groupSize || 1;
        if (currentPlayerCount + playerCount <= count) {
          selected.push(entry);
          currentPlayerCount += playerCount;
        }
      }
    }

    // Second pass: if we didn't fill completely, try smaller skipped groups
    if (currentPlayerCount < count) {
      for (const group of skippedGroups) {
        const groupPlayerCount = countPlayers(group);
        if (currentPlayerCount + groupPlayerCount <= count) {
          selected.push(...group);
          currentPlayerCount += groupPlayerCount;
        }
        if (currentPlayerCount >= count) break;
      }
    }

    return selected;
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
    queue: QueueEntry[]
  ): {
    playersToQueue: string[];
    playersToStay: string[];
  } {
    const team1 = [assignment.player1Id, assignment.player2Id].filter(
      Boolean
    ) as string[];
    const team2 = [assignment.player3Id, assignment.player4Id].filter(
      Boolean
    ) as string[];
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
