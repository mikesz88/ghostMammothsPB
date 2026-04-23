import type { RotationType, TeamSize } from "@/lib/types";

export function teamSizeDisplayLabel(teamSize: TeamSize): string {
  switch (teamSize) {
    case 1:
      return "Solo (1v1)";
    case 2:
      return "Doubles (2v2)";
    case 3:
      return "Triplets (3v3)";
    case 4:
      return "Quads (4v4)";
  }
}

export function rotationTypeDisplayLabel(rotationType: RotationType): string {
  return rotationType
    .replace("-", " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}
