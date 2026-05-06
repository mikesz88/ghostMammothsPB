import type { RotationType } from "@/lib/types";

const ADMIN_END_GAME_COPY: Partial<
  Record<RotationType, { message: string; description: string }>
> = {
  "rotate-all": {
    message:
      "Game ended — players re-queued (others first, then court order).",
    description: "Use Assign Next to start the next game.",
  },
  "2-stay-2-off": {
    message:
      "Game ended — winners stay and will split to opposite teams; losers re-queued.",
    description: "Use Assign Next to fill partner spots from the queue.",
  },
  "winners-stay": {
    message: "Game ended — winners stay on this court; losers re-queued.",
    description: "Use Assign Next to fill the court from the queue.",
  },
};

const ADMIN_END_GAME_DEFAULT = {
  message: "Game ended.",
  description: "Use Assign Next to start the next game.",
} as const;

/** Admin console end-game success copy (mentions Assign Next). */
export function adminEndGameSuccessToast(
  rotationType: RotationType,
): { message: string; description: string } {
  return ADMIN_END_GAME_COPY[rotationType] ?? ADMIN_END_GAME_DEFAULT;
}
