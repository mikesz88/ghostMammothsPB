import { describe, expect, it } from "vitest";

import { expandNextPlayersToPlayerSlots } from "@/lib/queue/services/court-assignment-expand-slots";
import {
  resolveNextPlayersForCourt,
  type EventRow,
} from "@/lib/queue/services/court-assignment-helpers";
import { partitionMultiSlotEntriesFirstForDoubles } from "@/lib/queue/services/court-assignment-next-players-order";

import type { ManagerEntry } from "@/lib/queue/mappers";
import type { RotationType } from "@/lib/types";

function entry(
  p: Partial<ManagerEntry> & Pick<ManagerEntry, "id" | "userId">,
): ManagerEntry {
  return {
    eventId: "ev-test",
    player_names: [],
    position: 1,
    status: "waiting",
    joinedAt: new Date(),
    groupSize: (p.groupSize ?? 1) as ManagerEntry["groupSize"],
    ...p,
  } as ManagerEntry;
}

function doublesEvent(rotation: RotationType = "rotate-all"): EventRow {
  return {
    team_size: 2,
    rotation_type: rotation,
  } as EventRow;
}

describe("partitionMultiSlotEntriesFirstForDoubles", () => {
  it("moves multi-slot groups before solos (solo–duo–solo → duo–solo–solo)", () => {
    const soloA = entry({ id: "a", userId: "ua", groupSize: 1 });
    const duo = entry({
      id: "d",
      userId: "captain",
      groupSize: 2,
      player_names: [
        { name: "A", skillLevel: "intermediate" },
        { name: "B", skillLevel: "intermediate" },
      ],
    });
    const soloB = entry({ id: "b", userId: "ub", groupSize: 1 });
    const ordered = partitionMultiSlotEntriesFirstForDoubles([soloA, duo, soloB]);
    expect(ordered.map((e) => e.id)).toEqual(["d", "a", "b"]);
  });

  it("preserves relative order within multi and within solo buckets", () => {
    const s1 = entry({ id: "s1", userId: "u1" });
    const s2 = entry({ id: "s2", userId: "u2" });
    const d1 = entry({ id: "d1", userId: "c1", groupSize: 2 });
    const d2 = entry({ id: "d2", userId: "c2", groupSize: 2 });
    const ordered = partitionMultiSlotEntriesFirstForDoubles([s1, d1, s2, d2]);
    expect(ordered.map((e) => e.id)).toEqual(["d1", "d2", "s1", "s2"]);
  });
});

describe("resolveNextPlayersForCourt + slot expansion (doubles)", () => {
  it("keeps a duo on one side of the net (first two slots = same captain)", () => {
    const soloA = entry({ id: "a", userId: "ua" });
    const duo = entry({
      id: "d",
      userId: "captain",
      groupSize: 2,
      player_names: [
        { name: "P1", skillLevel: "intermediate" },
        { name: "P2", skillLevel: "intermediate" },
      ],
    });
    const soloB = entry({ id: "b", userId: "ub" });

    const resolved = resolveNextPlayersForCourt({
      event: doublesEvent(),
      rotationType: "rotate-all",
      stayingMapped: [],
      newFromQueue: [soloA, duo, soloB],
      playersPerCourt: 4,
    });

    expect(resolved.success).toBe(true);
    if (!resolved.success) return;

    const slots = expandNextPlayersToPlayerSlots(resolved.nextPlayers);
    expect(slots).toHaveLength(4);
    expect(slots[0]?.userId).toBe("captain");
    expect(slots[1]?.userId).toBe("captain");
    expect(slots[2]?.userId).toBe("ua");
    expect(slots[3]?.userId).toBe("ub");
  });

  it("partition with stayers + queue (stayer + solo + duo from queue)", () => {
    const stayer = entry({ id: "st", userId: "us" });
    const soloMid = entry({ id: "mid", userId: "umid" });
    const duo = entry({
      id: "d",
      userId: "captain",
      groupSize: 2,
      player_names: [
        { name: "A", skillLevel: "beginner" },
        { name: "B", skillLevel: "beginner" },
      ],
    });

    const resolved = resolveNextPlayersForCourt({
      event: doublesEvent(),
      rotationType: "rotate-all",
      stayingMapped: [stayer],
      newFromQueue: [soloMid, duo],
      playersPerCourt: 4,
    });

    expect(resolved.success).toBe(true);
    if (!resolved.success) return;

    const slots = expandNextPlayersToPlayerSlots(resolved.nextPlayers);
    expect(slots[0]?.userId).toBe("captain");
    expect(slots[1]?.userId).toBe("captain");
  });
});
