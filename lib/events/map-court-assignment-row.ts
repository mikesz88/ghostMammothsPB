import { mapCourtAssignmentPlayers } from "@/lib/events/map-court-assignment-players";

import type { CourtAssignment } from "@/lib/types";

export function mapOneCourtAssignmentRow(
  assignment: Record<string, unknown>,
): CourtAssignment {
  return {
    id: assignment.id as string,
    eventId: assignment.event_id as string,
    courtNumber: assignment.court_number as number,
    player1Id: assignment.player1_id as string | undefined,
    player2Id: assignment.player2_id as string | undefined,
    player3Id: assignment.player3_id as string | undefined,
    player4Id: assignment.player4_id as string | undefined,
    player5Id: assignment.player5_id as string | undefined,
    player6Id: assignment.player6_id as string | undefined,
    player7Id: assignment.player7_id as string | undefined,
    player8Id: assignment.player8_id as string | undefined,
    player_names: (assignment.player_names as string[]) || [],
    startedAt: new Date(assignment.started_at as string),
    endedAt: assignment.ended_at
      ? new Date(assignment.ended_at as string)
      : undefined,
    ...mapCourtAssignmentPlayers(assignment),
  };
}
