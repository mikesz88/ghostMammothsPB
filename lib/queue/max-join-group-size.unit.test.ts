import { describe, expect, it } from "vitest";

import {
  maxJoinGroupSizeForEvent,
  maxJoinGroupSizeForEventTeamSize,
} from "@/lib/queue/max-join-group-size";

describe("maxJoinGroupSizeForEvent", () => {
  it("winners-stay caps at team_size", () => {
    expect(maxJoinGroupSizeForEvent(1, "winners-stay")).toBe(1);
    expect(maxJoinGroupSizeForEvent(2, "winners-stay")).toBe(2);
    expect(maxJoinGroupSizeForEvent(3, "winners-stay")).toBe(3);
  });

  it("rotate-all uses court-fill cap for doubles/singles", () => {
    expect(maxJoinGroupSizeForEvent(1, "rotate-all")).toBe(
      maxJoinGroupSizeForEventTeamSize(1),
    );
    expect(maxJoinGroupSizeForEvent(2, "rotate-all")).toBe(
      maxJoinGroupSizeForEventTeamSize(2),
    );
  });

  it("2-stay-2-off is solo only", () => {
    expect(maxJoinGroupSizeForEvent(2, "2-stay-2-off")).toBe(1);
  });
});
