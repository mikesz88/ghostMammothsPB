"use client";

import { useCallback } from "react";

import { showEndGameConfirmToast } from "@/lib/hooks/event-detail-end-game-flow";

import type { RotationType } from "@/lib/types";

export function useEventDetailEndGameHandler(
  eventId: string,
  rotationType: RotationType,
) {
  return useCallback(
    async (assignmentId: string, winningTeam: "team1" | "team2") => {
      showEndGameConfirmToast(
        eventId,
        rotationType,
        assignmentId,
        winningTeam,
      );
    },
    [eventId, rotationType],
  );
}
