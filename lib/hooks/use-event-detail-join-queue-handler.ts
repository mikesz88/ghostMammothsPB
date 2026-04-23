"use client";

import { useCallback } from "react";
import { toast } from "sonner";

import { joinQueue } from "@/app/actions/queue";
import { courtAssignmentIncludesUser } from "@/lib/events/court-assignment-utils";
import {
  isActiveQueueStatus,
  type JoinPlayer,
  type SendNotification,
} from "@/lib/hooks/event-detail-queue-handlers-types";

import type { CourtAssignment, QueueEntry } from "@/lib/types";
import type { User as SupabaseAuthUser } from "@supabase/supabase-js";

type Params = {
  eventId: string;
  eventName: string;
  user: SupabaseAuthUser | null;
  queue: QueueEntry[];
  assignments: CourtAssignment[];
  waitingCount: number;
  refetchQueue: () => Promise<void>;
  sendNotification: SendNotification;
  setShowJoinDialog: (open: boolean) => void;
};

export function useEventDetailJoinQueueHandler({
  eventId,
  eventName,
  user,
  queue,
  assignments,
  waitingCount,
  refetchQueue,
  sendNotification,
  setShowJoinDialog,
}: Params) {
  return useCallback(
    async (players: JoinPlayer[], groupSize: number) => {
      if (!user) return;

      const alreadyInQueue = queue.find(
        (e) =>
          e.userId === user.id &&
          (isActiveQueueStatus(e.status) || e.status === "playing"),
      );

      if (alreadyInQueue) {
        toast.error("Already in queue", {
          description: "You're already in the queue for this event.",
        });
        return;
      }

      const alreadyPlaying = assignments.some(
        (assignment) =>
          !assignment.endedAt &&
          courtAssignmentIncludesUser(assignment, user.id),
      );

      if (alreadyPlaying) {
        toast.error("Already playing", {
          description:
            "You're currently playing on a court. Finish your game first.",
        });
        return;
      }

      try {
        const groupId = groupSize > 1 ? crypto.randomUUID() : undefined;

        const { error } = await joinQueue(
          eventId,
          user.id,
          groupSize,
          groupId,
          players,
        );

        if (error) {
          console.error("Error joining queue:", error);
          toast.error("Failed to join queue", {
            description: "Please try again.",
          });
          return;
        }

        setShowJoinDialog(false);
        await refetchQueue();

        const groupText = groupSize > 1 ? ` as a group of ${groupSize}` : "";
        sendNotification("queue-join", "Successfully Joined Queue", {
          body: `You're now in position #${waitingCount + 1}${groupText} for ${eventName}`,
          tag: "queue-join",
        });
      } catch (err) {
        console.error("Error joining queue:", err);
        toast.error("An unexpected error occurred", {
          description: "Please try again.",
        });
      }
    },
    [
      user,
      queue,
      assignments,
      eventId,
      eventName,
      refetchQueue,
      sendNotification,
      waitingCount,
      setShowJoinDialog,
    ],
  );
}
