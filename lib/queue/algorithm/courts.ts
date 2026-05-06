import type { CourtAssignment } from "@/lib/types";

export function getAvailableCourts(
  courtCount: number,
  currentAssignments: CourtAssignment[],
): number[] {
  const occupiedCourts = new Set(
    currentAssignments.filter((a) => !a.endedAt).map((a) => a.courtNumber),
  );

  const available: number[] = [];
  for (let i = 1; i <= courtCount; i++) {
    if (!occupiedCourts.has(i)) {
      available.push(i);
    }
  }
  return available;
}
