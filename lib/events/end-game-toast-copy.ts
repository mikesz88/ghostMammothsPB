import type { RotationType } from "@/lib/types";

export function endGameSuccessToast(
  rotationType: RotationType,
): { message: string; description?: string } {
  if (rotationType === "rotate-all") {
    return {
      message:
        "Game ended — players re-queued (others first, then court order).",
      description: "Wait for the next group to be assigned to the court.",
    };
  }
  if (rotationType === "winners-stay") {
    return {
      message: "Game ended — winners stay on this court; losers re-queued.",
    };
  }
  if (rotationType === "2-stay-2-off") {
    return {
      message:
        "Game ended — winners stay and will split to opposite teams; losers re-queued.",
    };
  }
  return { message: "Game ended." };
}
