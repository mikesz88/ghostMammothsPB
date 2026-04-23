"use client";

import { toast } from "sonner";

import {
  adminRemoveFromQueue,
  assignPlayersToNextCourt,
  endGameAndReorderQueue,
} from "@/app/actions/queue";
import { adminAssignNextTeamSizeLabel } from "@/lib/admin/admin-assign-next-copy";
import { adminEndGameSuccessToast } from "@/lib/admin/admin-end-game-toast-copy";
import { adminQueueQueryKey } from "@/lib/admin-queue";
import { createClient } from "@/lib/supabase/client";

import type { Event } from "@/lib/types";
import type { QueryClient } from "@tanstack/react-query";

export function useAdminEventDetailActions(
  eventId: string,
  event: Event,
  queryClient: QueryClient,
) {
  const handleAssignNext = async () => {
    try {
      const result = await assignPlayersToNextCourt(eventId);

      if (result.success) {
        const teamSizeText = adminAssignNextTeamSizeLabel(event.teamSize);
        toast.success(
          `Assigned ${result.playersAssigned} players to Court ${result.courtNumber}`,
          {
            description: `${teamSizeText} game started`,
          },
        );
      } else {
        toast.error("Failed to assign players", {
          description: result.error,
        });
      }
    } catch (err) {
      console.error("Error assigning players:", err);
      toast.error("Failed to assign players");
    }
  };

  const handleForceRemove = async (entryId: string) => {
    if (
      !confirm("Are you sure you want to remove this player from the queue?")
    ) {
      return;
    }

    try {
      const { error } = await adminRemoveFromQueue(entryId);

      if (error) {
        toast.error("Failed to remove player", {
          description: error,
        });
      } else {
        toast.success("Player removed from queue");
        await queryClient.invalidateQueries({
          queryKey: adminQueueQueryKey(eventId),
        });
      }
    } catch (err) {
      console.error("❌ [ADMIN PAGE] Exception in handleForceRemove:", err);
      toast.error("Failed to remove player");
    }
  };

  const handleClearQueue = async () => {
    if (
      !confirm(
        "Are you sure you want to clear the entire queue? This cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const supabase = createClient();
      await supabase
        .from("court_pending_stayers")
        .delete()
        .eq("event_id", eventId);

      const { error } = await supabase
        .from("queue_entries")
        .delete()
        .eq("event_id", eventId)
        .in("status", ["waiting", "pending_solo"]);

      if (error) {
        console.error("Error clearing queue:", error);
        toast.error("Failed to clear queue", {
          description: error.message,
        });
      } else {
        toast.success("Queue cleared successfully");
        await queryClient.invalidateQueries({
          queryKey: adminQueueQueryKey(eventId),
        });
      }
    } catch (err) {
      console.error("Error clearing queue:", err);
      toast.error("Failed to clear queue");
    }
  };

  const performEndGame = async (
    ev: Event,
    assignmentId: string,
    winningTeam: "team1" | "team2",
  ) => {
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

      const { message, description } = adminEndGameSuccessToast(ev.rotationType);
      toast.success(message, { description });
    } catch (err) {
      console.error("Error ending game:", err);
      toast.error("Failed to end game");
    }
  };

  const handleEndGame = async (
    assignmentId: string,
    winningTeam: "team1" | "team2",
  ) => {
    const winningTeamName = winningTeam === "team1" ? "Team 1" : "Team 2";

    toast(`Mark this game as complete?`, {
      description: `${winningTeamName} wins!`,
      action: {
        label: "End Game",
        onClick: async () => {
          await performEndGame(event, assignmentId, winningTeam);
        },
      },
      cancel: {
        label: "Cancel",
        onClick: () => {},
      },
    });
  };

  return {
    handleAssignNext,
    handleForceRemove,
    handleClearQueue,
    handleEndGame,
  };
}
