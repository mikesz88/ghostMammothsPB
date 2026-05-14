import type { RotationType, TeamSize } from "@/lib/types";

function normalizedTeamSize(teamSize: number | null | undefined): TeamSize {
  const raw = teamSize ?? 2;
  const n = Number.isFinite(raw) && raw > 0 ? raw : 2;
  return n as TeamSize;
}

/**
 * Max `group_size` for rotate-all (and default): players-per-court for 1v1/2v2
 * so groups can fill alone or combine (e.g. 3 + 1 doubles). 3v3/4v4 cap at one team.
 */
export function maxJoinGroupSizeForEventTeamSize(teamSize: number): number {
  const ts = teamSize as TeamSize;
  if (ts === 1) return 2;
  if (ts === 2) return 4;
  if (ts === 3) return 3;
  return 4;
}

/**
 * Max `group_size` when joining the queue, including rotation rules.
 * - **winners-stay:** at most one side of the net (`team_size`) so a queue group matches who can stay.
 * - **2-stay-2-off:** solo only (1).
 * - **rotate-all:** {@link maxJoinGroupSizeForEventTeamSize}.
 */
export function maxJoinGroupSizeForEvent(
  teamSize: number,
  rotationType: RotationType,
): number {
  if (rotationType === "2-stay-2-off") return 1;
  if (rotationType === "winners-stay") {
    return normalizedTeamSize(teamSize);
  }
  return maxJoinGroupSizeForEventTeamSize(teamSize);
}

export function joinGroupSizeValidationError(
  teamSize: number | null | undefined,
  groupSize: number,
  rotationType: RotationType,
): string | null {
  if (!Number.isInteger(groupSize) || groupSize < 1) {
    return "Invalid group size.";
  }
  const ts = normalizedTeamSize(teamSize);
  const max = maxJoinGroupSizeForEvent(ts, rotationType);
  if (groupSize > max) {
    return `Group size must be at most ${max} for this event format.`;
  }
  return null;
}
