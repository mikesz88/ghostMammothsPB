import {
  collectExactCombinations,
  isFifoBetterCombination,
} from "@/lib/queue/algorithm/combinations";

import type { QueueEntry } from "@/lib/types";


/**
 * Gets next N players from queue using subset-sum over atomic groups.
 *
 * IMPORTANT: Groups are NEVER split - they are treated as atomic units.
 *
 * Queue order is by ascending `position` (index 0 = front of line). Among all
 * combinations of groups whose sizes sum to exactly `count`, pick the most
 * front-loaded (FIFO):
 * 1) Minimize sum of selected group indices — take from the front of the queue
 *    first (rotate-all: players who just finished are at the back and must not
 *    be chosen ahead of people who were already waiting when both sets fit).
 * 2) Tie: lexicographically smaller sorted index list (earlier groups win).
 */
export function getNextPlayers(
  queue: QueueEntry[],
  count: number,
): QueueEntry[] {
  const groups: QueueEntry[][] = [];
  const processedGroupIds = new Set<string>();

  for (const entry of queue) {
    if (entry.groupId && !processedGroupIds.has(entry.groupId)) {
      const groupMembers = queue.filter((e) => e.groupId === entry.groupId);
      groups.push(groupMembers);
      processedGroupIds.add(entry.groupId);
    } else if (!entry.groupId) {
      groups.push([entry]);
    }
  }

  const countPlayers = (entries: QueueEntry[]): number => {
    return entries.reduce((sum, entry) => sum + (entry.groupSize || 1), 0);
  };

  const groupSizes = groups.map(countPlayers);
  const solutions: number[][] = [];
  collectExactCombinations(groupSizes, count, 0, [], 0, solutions);

  if (solutions.length === 0) {
    return [];
  }

  const bestIndices = solutions.reduce((best, cur) =>
    isFifoBetterCombination(cur, best) ? cur : best,
  );

  return bestIndices.flatMap((idx) => groups[idx]);
}
