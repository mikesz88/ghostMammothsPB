"use client";

import { toast } from "sonner";

import { adminRemoveFromQueue, leaveQueue } from "@/app/actions/queue";

import type { SendNotification } from "@/lib/hooks/event-detail-queue-handlers-types";

export async function removeQueueEntryAsAdmin(
  entryId: string,
  refetchQueue: () => Promise<void>,
) {
  if (!confirm("Are you sure you want to remove this player from the queue?")) {
    return;
  }
  const { error } = await adminRemoveFromQueue(entryId);
  if (error) {
    console.error("Error removing player from queue:", error);
    toast.error("Failed to remove player", { description: error });
    return;
  }
  await refetchQueue();
  toast.success("Player removed from queue");
}

export async function removeQueueEntryAsSelf(
  entryId: string,
  eventName: string,
  refetchQueue: () => Promise<void>,
  sendNotification: SendNotification,
) {
  const { error } = await leaveQueue(entryId);
  if (error) {
    console.error("Error leaving queue:", error);
    toast.error("Failed to leave queue", { description: "Please try again." });
    return;
  }
  await refetchQueue();
  sendNotification("queue-leave", "Left Queue", {
    body: `You've been removed from the queue for ${eventName}`,
    tag: "queue-leave",
  });
}

export type DispatchQueueEntryRemovalParams = {
  entryId: string;
  isSelf: boolean;
  isAdmin: boolean;
  eventName: string;
  refetchQueue: () => Promise<void>;
  sendNotification: SendNotification;
};

async function runQueueEntryRemovalBranch(p: DispatchQueueEntryRemovalParams) {
  if (p.isAdmin && !p.isSelf) {
    await removeQueueEntryAsAdmin(p.entryId, p.refetchQueue);
    return;
  }
  await removeQueueEntryAsSelf(
    p.entryId,
    p.eventName,
    p.refetchQueue,
    p.sendNotification,
  );
}

export async function dispatchQueueEntryRemoval(
  p: DispatchQueueEntryRemovalParams,
) {
  try {
    await runQueueEntryRemovalBranch(p);
  } catch (err) {
    console.error("Error updating queue:", err);
    toast.error("An unexpected error occurred", {
      description: "Please try again.",
    });
  }
}
