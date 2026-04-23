"use client";

import { useCallback } from "react";
import { toast } from "sonner";

import { endGameAndReorderQueue } from "@/app/actions/queue";
import { endGameSuccessToast } from "@/lib/events/end-game-toast-copy";

import type { RotationType } from "@/lib/types";

export function useEventDetailEndGameHandler(
  eventId: string,
  rotationType: RotationType,
) {
  return useCallback(
    async (assignmentId: string, winningTeam: "team1" | "team2") => {
      const winningTeamName = winningTeam === "team1" ? "Team 1" : "Team 2";
      toast(`Mark this game as complete?`, {
        description: `${winningTeamName} wins!`,
        action: {
          label: "End Game",
          onClick: async () => {
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
              const { message, description } =
                endGameSuccessToast(rotationType);
              if (description) {
                toast.success(message, { description });
              } else {
                toast.success(message);
              }
            } catch (err) {
              console.error("Error ending game:", err);
              toast.error("Failed to end game");
            }
          },
        },
        cancel: {
          label: "Cancel",
          onClick: () => {},
        },
      });
    },
    [eventId, rotationType],
  );
}
