"use client";

import {
  flowAssignNextToCourt,
  flowAdminRemoveQueueEntry,
  flowClearWaitingQueue,
  promptAdminEndGame,
} from "@/lib/admin/admin-event-detail-action-flows";

import type { Event } from "@/lib/types";
import type { QueryClient } from "@tanstack/react-query";

export function useAdminEventDetailActions(
  eventId: string,
  event: Event,
  queryClient: QueryClient,
) {
  const handleAssignNext = async () => {
    await flowAssignNextToCourt(eventId, event.teamSize);
  };

  const handleForceRemove = async (entryId: string) => {
    await flowAdminRemoveQueueEntry(entryId, eventId, queryClient);
  };

  const handleClearQueue = async () => {
    await flowClearWaitingQueue(eventId, queryClient);
  };

  const handleEndGame = (assignmentId: string, winningTeam: "team1" | "team2") => {
    promptAdminEndGame(eventId, event, assignmentId, winningTeam);
  };

  return {
    handleAssignNext,
    handleForceRemove,
    handleClearQueue,
    handleEndGame,
  };
}
