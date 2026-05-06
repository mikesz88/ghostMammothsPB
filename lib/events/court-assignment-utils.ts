import type { CourtAssignment } from "@/lib/types";

const PLAYER_ID_KEYS = [
  "player1Id",
  "player2Id",
  "player3Id",
  "player4Id",
  "player5Id",
  "player6Id",
  "player7Id",
  "player8Id",
] as const satisfies readonly (keyof CourtAssignment)[];

export function courtAssignmentIncludesUser(
  assignment: CourtAssignment,
  userId: string,
): boolean {
  return PLAYER_ID_KEYS.some((key) => assignment[key] === userId);
}
