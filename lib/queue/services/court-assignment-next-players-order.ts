import { countSlotsForEntries, type ManagerEntry } from "@/lib/queue/mappers";

export function orderedPlayers2Stay2OffDoubles(
  stayingMapped: ManagerEntry[],
  newFromQueue: ManagerEntry[],
): ManagerEntry[] | null {
  if (
    stayingMapped.length === 2 &&
    newFromQueue.length === 2 &&
    countSlotsForEntries(stayingMapped) === 2 &&
    countSlotsForEntries(newFromQueue) === 2
  ) {
    return [
      stayingMapped[0],
      newFromQueue[0],
      stayingMapped[1],
      newFromQueue[1],
    ];
  }
  return null;
}

/**
 * Doubles (team_size 2): flattened slots are team 1 = indices [0,1], team 2 = [2,3].
 * Entry order solo → duo → solo yields S, D1, D2, S and splits the duo across teams.
 * Stable partition: all multi-slot entries first keeps each duo on one side of the net.
 */
export function partitionMultiSlotEntriesFirstForDoubles(
  nextPlayers: ManagerEntry[],
): ManagerEntry[] {
  const multi: ManagerEntry[] = [];
  const single: ManagerEntry[] = [];
  for (const entry of nextPlayers) {
    if ((entry.groupSize || 1) > 1) multi.push(entry);
    else single.push(entry);
  }
  return [...multi, ...single];
}
