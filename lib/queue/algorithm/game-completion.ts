import type { CourtAssignment, QueueEntry, RotationType, TeamSize } from "@/lib/types";

export function handleGameCompletion(
  assignment: CourtAssignment,
  rotationType: RotationType,
  winningTeam: "team1" | "team2",
  _queue: QueueEntry[],
  teamSize: TeamSize,
): {
  playersToQueue: string[];
  playersToStay: string[];
} {
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

  const team1 = allPlayerIds.slice(0, teamSize);
  const team2 = allPlayerIds.slice(teamSize, teamSize * 2);

  const winners = winningTeam === "team1" ? team1 : team2;
  const losers = winningTeam === "team1" ? team2 : team1;

  switch (rotationType) {
    case "winners-stay":
      return {
        playersToStay: winners,
        playersToQueue: losers,
      };

    case "2-stay-2-off":
      return {
        playersToStay: winners,
        playersToQueue: losers,
      };

    case "rotate-all":
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
