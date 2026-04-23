"use client";

import { useCallback } from "react";
import { toast } from "sonner";

import { adminRemoveFromQueue, leaveQueue } from "@/app/actions/queue";

import type { SendNotification } from "@/lib/hooks/event-detail-queue-handlers-types";
import type { QueueEntry } from "@/lib/types";

type Params = {
  eventName: string;
  userId: string | undefined;
  queue: QueueEntry[];
  isAdmin: boolean;
  refetchQueue: () => Promise<void>;
  sendNotification: SendNotification;
};

export function useEventDetailQueueRemoveHandler({
  eventName,
  userId,
  queue,
  isAdmin,
  refetchQueue,
  sendNotification,
}: Params) {
  return useCallback(
    async (entryId: string) => {
      const entry = queue.find((e) => e.id === entryId);
      if (!entry) return;

      const isSelf = entry.userId === userId;

      try {
        if (isAdmin && !isSelf) {
          if (
            !confirm(
              "Are you sure you want to remove this player from the queue?",
            )
          ) {
            return;
          }
          const { error } = await adminRemoveFromQueue(entryId);
          if (error) {
            console.error("Error removing player from queue:", error);
            toast.error("Failed to remove player", {
              description: error,
            });
            return;
          }
          await refetchQueue();
          toast.success("Player removed from queue");
          return;
        }

        const { error } = await leaveQueue(entryId);
        if (error) {
          console.error("Error leaving queue:", error);
          toast.error("Failed to leave queue", {
            description: "Please try again.",
          });
          return;
        }

        await refetchQueue();
        sendNotification("queue-leave", "Left Queue", {
          body: `You've been removed from the queue for ${eventName}`,
          tag: "queue-leave",
        });
      } catch (err) {
        console.error("Error updating queue:", err);
        toast.error("An unexpected error occurred", {
          description: "Please try again.",
        });
      }
    },
    [queue, userId, isAdmin, refetchQueue, sendNotification, eventName],
  );
}
