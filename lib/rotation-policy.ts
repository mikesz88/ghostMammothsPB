import type { RotationType, TeamSize } from "./types";

export function isRotateAllStyleRotation(rt: RotationType): boolean {
  return rt === "rotate-all";
}

/** Winners (or partial winners) stay on court; losers re-queue. */
export function isWinnersStayStyleRotation(rt: RotationType): boolean {
  return rt === "winners-stay" || rt === "2-stay-2-off";
}

export function is2Stay2OffRotation(rt: RotationType): boolean {
  return rt === "2-stay-2-off";
}

/** 2-stay-2-off is doubles-only (four slots, two winners + two from queue). */
export function is2Stay2OffValidTeamSize(teamSize: TeamSize): boolean {
  return teamSize === 2;
}
