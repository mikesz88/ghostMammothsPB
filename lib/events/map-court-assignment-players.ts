import { mapPlayer } from "@/lib/events/map-court-assignments-shared";

import type { CourtAssignment, User } from "@/lib/types";

type PlayerRow = {
  id: string;
  name: string;
  email: string;
  skill_level: string;
};

function mapOptionalPlayer(raw: unknown): User | undefined {
  return raw ? mapPlayer(raw as PlayerRow) : undefined;
}

const PLAYER_KEYS = [
  "player1",
  "player2",
  "player3",
  "player4",
  "player5",
  "player6",
  "player7",
  "player8",
] as const;

type CourtPlayerKeys = (typeof PLAYER_KEYS)[number];

export function mapCourtAssignmentPlayers(
  assignment: Record<string, unknown>,
): Pick<CourtAssignment, CourtPlayerKeys> {
  return Object.fromEntries(
    PLAYER_KEYS.map((key) => [key, mapOptionalPlayer(assignment[key])]),
  ) as Pick<CourtAssignment, CourtPlayerKeys>;
}
