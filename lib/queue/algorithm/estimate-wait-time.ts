import type { TeamSize } from "@/lib/types";

export function estimateWaitTime(
  position: number,
  courtCount: number,
  teamSize: TeamSize,
  avgGameMinutes = 15,
): number {
  const playersPerRound = courtCount * teamSize * 2;
  const roundsToWait = Math.ceil(position / playersPerRound);
  return roundsToWait * avgGameMinutes;
}
