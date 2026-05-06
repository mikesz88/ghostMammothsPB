"use client";

import { toast } from "sonner";

import { endGameAndReorderQueue } from "@/app/actions/queue";
import { endGameSuccessToast } from "@/lib/events/end-game-toast-copy";

import type { RotationType } from "@/lib/types";

function toastEndGameOk(rotationType: RotationType) {
  const { message, description } = endGameSuccessToast(rotationType);
  if (description) toast.success(message, { description });
  else toast.success(message);
}

export async function runEndGameFromConfirm(
  eventId: string,
  rotationType: RotationType,
  assignmentId: string,
  winningTeam: "team1" | "team2",
) {
  try {
    const result = await endGameAndReorderQueue(
      eventId,
      assignmentId,
      winningTeam,
    );
    if (!result.success) {
      toast.error(result.error || "Failed to end game");
      return;
    }
    toastEndGameOk(rotationType);
  } catch (err) {
    console.error("Error ending game:", err);
    toast.error("Failed to end game");
  }
}

export function showEndGameConfirmToast(
  eventId: string,
  rotationType: RotationType,
  assignmentId: string,
  winningTeam: "team1" | "team2",
) {
  const winningTeamName = winningTeam === "team1" ? "Team 1" : "Team 2";
  toast(`Mark this game as complete?`, {
    description: `${winningTeamName} wins!`,
    action: {
      label: "End Game",
      onClick: async () => {
        await runEndGameFromConfirm(
          eventId,
          rotationType,
          assignmentId,
          winningTeam,
        );
      },
    },
    cancel: { label: "Cancel", onClick: () => {} },
  });
}
