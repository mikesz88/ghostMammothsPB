import type { QueueEntry } from "@/lib/types";

export function reorderQueue(queue: QueueEntry[]): QueueEntry[] {
  return queue
    .filter((entry) => entry.status === "waiting")
    .sort((a, b) => a.position - b.position)
    .map((entry, index) => ({
      ...entry,
      position: index + 1,
    }));
}
