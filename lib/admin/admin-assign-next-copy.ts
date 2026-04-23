import type { TeamSize } from "@/lib/types";

/** Lowercase label for assign-next success toast (matches former admin page). */
export function adminAssignNextTeamSizeLabel(teamSize: TeamSize): string {
  switch (teamSize) {
    case 1:
      return "solo";
    case 2:
      return "doubles";
    case 3:
      return "triplets";
    case 4:
      return "quads";
  }
}

/** Short lowercase label for validation copy in test controls. */
export function adminTeamSizeShortLabel(teamSize: number): string {
  if (teamSize === 1) return "solo";
  if (teamSize === 2) return "doubles";
  if (teamSize === 3) return "triplets";
  return "quads";
}
