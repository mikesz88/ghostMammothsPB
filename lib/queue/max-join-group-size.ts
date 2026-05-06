import type { TeamSize } from "@/lib/types";

/**
 * Max `group_size` allowed when joining the queue for an event.
 * For 1v1 / 2v2, caps are players-per-court so groups can fill a full court alone
 * or merge with others (e.g. 3 + 1 for doubles).
 * Larger formats keep the legacy cap of one team’s worth (matches previous join UI).
 */
export function maxJoinGroupSizeForEventTeamSize(teamSize: number): number {
  const ts = teamSize as TeamSize;
  if (ts === 1) return 2;
  if (ts === 2) return 4;
  if (ts === 3) return 3;
  return 4;
}

export function joinGroupSizeValidationError(
  teamSize: number | null | undefined,
  groupSize: number,
): string | null {
  if (!Number.isInteger(groupSize) || groupSize < 1) {
    return "Invalid group size.";
  }
  const raw = teamSize ?? 2;
  const ts = Number.isFinite(raw) && raw > 0 ? raw : 2;
  const max = maxJoinGroupSizeForEventTeamSize(ts);
  if (groupSize > max) {
    return `Group size must be at most ${max} for this event format.`;
  }
  return null;
}
