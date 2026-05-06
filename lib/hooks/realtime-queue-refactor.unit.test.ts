import { describe, expect, it } from "vitest";

import { collectQueueLeaveTargetIds } from "@/lib/hooks/queue-leave-target-ids";
import { filterHiddenFromQueue } from "@/lib/hooks/use-realtime-queue-optimistic";

import type { QueueEntry } from "@/lib/types";

function q(p: Partial<QueueEntry> & Pick<QueueEntry, "id" | "userId">): QueueEntry {
  return {
    eventId: "e1",
    groupSize: 1,
    position: 1,
    status: "waiting",
    joinedAt: new Date(),
    ...p,
  } as QueueEntry;
}

describe("collectQueueLeaveTargetIds (a7e3d80 leave semantics)", () => {
  it("returns only the row when solo (no groupId)", () => {
    const entry = q({ id: "a", userId: "u1" });
    const queue = [entry, q({ id: "b", userId: "u2" })];
    expect(collectQueueLeaveTargetIds(entry, queue)).toEqual(["a"]);
  });

  it("returns all rows sharing groupId", () => {
    const g = "grp-1";
    const a = q({ id: "a", userId: "u1", groupId: g, groupSize: 2 });
    const b = q({ id: "b", userId: "u2", groupId: g, groupSize: 2 });
    const c = q({ id: "c", userId: "u3" });
    const queue = [a, b, c];
    expect(collectQueueLeaveTargetIds(a, queue).sort()).toEqual(["a", "b"].sort());
  });
});

describe("filterHiddenFromQueue (optimistic overlay)", () => {
  it("returns serverQueue unchanged when nothing hidden", () => {
    const rows = [q({ id: "1", userId: "a" }), q({ id: "2", userId: "b" })];
    expect(filterHiddenFromQueue(rows, [])).toEqual(rows);
  });

  it("removes hidden ids until server refetch matches", () => {
    const rows = [q({ id: "1", userId: "a" }), q({ id: "2", userId: "b" })];
    expect(filterHiddenFromQueue(rows, ["2"])).toEqual([rows[0]]);
  });

  it("after refetch without hidden row, full list shows (other viewers)", () => {
    const afterLeave = [q({ id: "1", userId: "a" })];
    expect(filterHiddenFromQueue(afterLeave, [])).toEqual(afterLeave);
  });
});
