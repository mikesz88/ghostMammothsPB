/**
 * Canonical `player1`–`player8` keys on `CourtAssignment` and related wire rows.
 * Phase 4 PR 6: one list for event-detail serialize/hydrate and court mappers.
 */
export const COURT_ASSIGNMENT_PLAYER_SLOTS = [
  "player1",
  "player2",
  "player3",
  "player4",
  "player5",
  "player6",
  "player7",
  "player8",
] as const;

export type CourtAssignmentPlayerSlot =
  (typeof COURT_ASSIGNMENT_PLAYER_SLOTS)[number];
