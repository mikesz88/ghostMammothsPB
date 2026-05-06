/** DFS: collect every subset of group indices whose sizes sum to `target`. */
export function collectExactCombinations(
  groupSizes: number[],
  target: number,
  startIdx: number,
  current: number[],
  currentSum: number,
  out: number[][],
): void {
  if (currentSum === target) {
    out.push([...current]);
    return;
  }
  if (currentSum > target || startIdx >= groupSizes.length) {
    return;
  }

  collectExactCombinations(
    groupSizes,
    target,
    startIdx + 1,
    [...current, startIdx],
    currentSum + groupSizes[startIdx],
    out,
  );
  collectExactCombinations(
    groupSizes,
    target,
    startIdx + 1,
    current,
    currentSum,
    out,
  );
}

/** True if `a` is preferred over `b` under FIFO (front-of-queue first) rules. */
export function isFifoBetterCombination(a: number[], b: number[]): boolean {
  const sumA = a.reduce((s, i) => s + i, 0);
  const sumB = b.reduce((s, i) => s + i, 0);
  if (sumA !== sumB) {
    return sumA < sumB;
  }
  const sa = [...a].sort((x, y) => x - y);
  const sb = [...b].sort((x, y) => x - y);
  const len = Math.max(sa.length, sb.length);
  for (let i = 0; i < len; i++) {
    const va = sa[i];
    const vb = sb[i];
    if (va === undefined) {
      return true;
    }
    if (vb === undefined) {
      return false;
    }
    if (va !== vb) {
      return va < vb;
    }
  }
  return false;
}
