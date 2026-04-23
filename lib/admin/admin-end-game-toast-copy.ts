import type { RotationType } from "@/lib/types";

/** Admin console end-game success copy (mentions Assign Next). */
export function adminEndGameSuccessToast(
  rotationType: RotationType,
): { message: string; description: string } {
  if (rotationType === "rotate-all") {
    return {
      message:
        "Game ended — players re-queued (others first, then court order).",
      description: "Use Assign Next to start the next game.",
    };
  }
  if (rotationType === "2-stay-2-off") {
    return {
      message:
        "Game ended — winners stay and will split to opposite teams; losers re-queued.",
      description: "Use Assign Next to fill partner spots from the queue.",
    };
  }
  if (rotationType === "winners-stay") {
    return {
      message: "Game ended — winners stay on this court; losers re-queued.",
      description: "Use Assign Next to fill the court from the queue.",
    };
  }
  return {
    message: "Game ended.",
    description: "Use Assign Next to start the next game.",
  };
}
