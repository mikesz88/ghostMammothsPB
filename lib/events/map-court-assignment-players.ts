import {
  COURT_ASSIGNMENT_PLAYER_SLOTS,
  type CourtAssignmentPlayerSlot,
} from "@/lib/events/court-assignment-player-slots";
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

export function mapCourtAssignmentPlayers(
  assignment: Record<string, unknown>,
): Pick<CourtAssignment, CourtAssignmentPlayerSlot> {
  return Object.fromEntries(
    COURT_ASSIGNMENT_PLAYER_SLOTS.map((key) => [
      key,
      mapOptionalPlayer(assignment[key]),
    ]),
  ) as Pick<CourtAssignment, CourtAssignmentPlayerSlot>;
}
