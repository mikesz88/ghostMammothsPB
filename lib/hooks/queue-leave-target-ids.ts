import type { QueueEntry } from "@/lib/types";

/** Queue row ids removed when leaving (whole group if `groupId` is shared). */
export function collectQueueLeaveTargetIds(
  entry: QueueEntry,
  queue: QueueEntry[],
): string[] {
  const ids = new Set<string>([entry.id]);
  if (entry.groupId) {
    for (const e of queue) {
      if (e.groupId === entry.groupId) ids.add(e.id);
    }
  }
  return [...ids];
}
