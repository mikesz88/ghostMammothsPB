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

import type { Event, TeamSize } from "@/lib/types";
import type { QueryClient } from "@tanstack/react-query";

export async function flowAssignNextToCourt(eventId: string, teamSize: TeamSize) {
  try {
    const result = await assignPlayersToNextCourt(eventId);
    if (result.success) {
      const teamSizeText = adminAssignNextTeamSizeLabel(teamSize);
      toast.success(
        `Assigned ${result.playersAssigned} players to Court ${result.courtNumber}`,
        { description: `${teamSizeText} game started` },
      );
    } else {
      toast.error("Failed to assign players", { description: result.error });
    }
  } catch (err) {
    console.error("Error assigning players:", err);
    toast.error("Failed to assign players");
  }
}

export async function flowAdminRemoveQueueEntry(
  entryId: string,
  eventId: string,
  queryClient: QueryClient,
) {
  if (!confirm("Are you sure you want to remove this player from the queue?")) {
    return;
  }
  try {
    const { error } = await adminRemoveFromQueue(entryId);
    if (error) {
      toast.error("Failed to remove player", { description: error });
    } else {
      toast.success("Player removed from queue");
      await queryClient.invalidateQueries({ queryKey: adminQueueQueryKey(eventId) });
    }
  } catch (err) {
    console.error("❌ [ADMIN PAGE] Exception in handleForceRemove:", err);
    toast.error("Failed to remove player");
  }
}

async function deleteWaitingQueueRows(eventId: string) {
  const supabase = createClient();
  await supabase.from("court_pending_stayers").delete().eq("event_id", eventId);
  return supabase
    .from("queue_entries")
    .delete()
    .eq("event_id", eventId)
    .in("status", ["waiting", "pending_solo"]);
}

export async function flowClearWaitingQueue(eventId: string, queryClient: QueryClient) {
  if (
    !confirm(
      "Are you sure you want to clear the entire queue? This cannot be undone.",
    )
  ) {
    return;
  }
  try {
    const { error } = await deleteWaitingQueueRows(eventId);
    if (error) {
      console.error("Error clearing queue:", error);
      toast.error("Failed to clear queue", { description: error.message });
    } else {
      toast.success("Queue cleared successfully");
      await queryClient.invalidateQueries({ queryKey: adminQueueQueryKey(eventId) });
    }
  } catch (err) {
    console.error("Error clearing queue:", err);
    toast.error("Failed to clear queue");
  }
}

export function promptAdminEndGame(
  eventId: string,
  ev: Event,
  assignmentId: string,
  winningTeam: "team1" | "team2",
) {
  const winningTeamName = winningTeam === "team1" ? "Team 1" : "Team 2";
  toast(`Mark this game as complete?`, {
    description: `${winningTeamName} wins!`,
    action: {
      label: "End Game",
      onClick: async () => {
        await flowEndGameWithToast(eventId, ev, assignmentId, winningTeam);
      },
    },
    cancel: { label: "Cancel", onClick: () => {} },
  });
}

export async function flowEndGameWithToast(
  eventId: string,
  ev: Event,
  assignmentId: string,
  winningTeam: "team1" | "team2",
) {
  try {
    const result = await endGameAndReorderQueue(eventId, assignmentId, winningTeam);
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
}
