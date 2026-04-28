type CollectComboParams = {
  groupSizes: number[];
  target: number;
  startIdx: number;
  current: number[];
  currentSum: number;
  out: number[][];
};

/** Subsets of group indices whose sizes sum to `target` (same semantics as QueueManager). */
export function collectExactCombinationIndices(p: CollectComboParams): void {
  const { groupSizes, target, startIdx, current, currentSum, out } = p;
  if (currentSum === target) {
    out.push([...current]);
    return;
  }
  if (currentSum > target || startIdx >= groupSizes.length) {
    return;
  }
  collectExactCombinationIndices({
    ...p,
    startIdx: startIdx + 1,
    current: [...current, startIdx],
    currentSum: currentSum + groupSizes[startIdx],
  });
  collectExactCombinationIndices({
    ...p,
    startIdx: startIdx + 1,
    current,
    currentSum,
  });
}

export function soloGroupIndexCanFillCourt(
  groupSizes: number[],
  soloGroupIdx: number,
  playersPerCourt: number,
): boolean {
  const solutions: number[][] = [];
  collectExactCombinationIndices({
    groupSizes,
    target: playersPerCourt,
    startIdx: 0,
    current: [],
    currentSum: 0,
    out: solutions,
  });
  return solutions.some((sol) => sol.includes(soloGroupIdx));
}
