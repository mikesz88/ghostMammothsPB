"use client";

import { toast } from "sonner";

import { adminRemoveFromQueue, leaveQueue } from "@/app/actions/queue";

import type { SendNotification } from "@/lib/hooks/event-detail/event-detail-queue-handlers-types";

export type DispatchQueueEntryRemovalResult =
  | { ok: true }
  | { ok: false; cancelled?: boolean };

export async function removeQueueEntryAsAdmin(
  entryId: string,
  refetchQueue: () => Promise<void>,
): Promise<DispatchQueueEntryRemovalResult> {
  if (!confirm("Are you sure you want to remove this player from the queue?")) {
    return { ok: false, cancelled: true };
  }
  const { error } = await adminRemoveFromQueue(entryId);
  if (error) {
    console.error("Error removing player from queue:", error);
    toast.error("Failed to remove player", { description: error });
    return { ok: false };
  }
  await refetchQueue();
  toast.success("Player removed from queue");
  return { ok: true };
}

export async function removeQueueEntryAsSelf(
  entryId: string,
  eventName: string,
  refetchQueue: () => Promise<void>,
  sendNotification: SendNotification,
): Promise<DispatchQueueEntryRemovalResult> {
  const { error } = await leaveQueue(entryId);
  if (error) {
    console.error("Error leaving queue:", error);
    toast.error("Failed to leave queue", {
      description: "You're still in the queue. Please try again.",
    });
    return { ok: false };
  }
  await refetchQueue();
  sendNotification("queue-leave", "Left Queue", {
    body: `You've been removed from the queue for ${eventName}`,
    tag: "queue-leave",
  });
  return { ok: true };
}

export type DispatchQueueEntryRemovalParams = {
  entryId: string;
  isSelf: boolean;
  isAdmin: boolean;
  eventName: string;
  refetchQueue: () => Promise<void>;
  sendNotification: SendNotification;
};

async function runQueueEntryRemovalBranch(
  p: DispatchQueueEntryRemovalParams,
): Promise<DispatchQueueEntryRemovalResult> {
  if (p.isAdmin && !p.isSelf) {
    return removeQueueEntryAsAdmin(p.entryId, p.refetchQueue);
  }
  return removeQueueEntryAsSelf(
    p.entryId,
    p.eventName,
    p.refetchQueue,
    p.sendNotification,
  );
}

export async function dispatchQueueEntryRemoval(
  p: DispatchQueueEntryRemovalParams,
): Promise<DispatchQueueEntryRemovalResult> {
  try {
    return await runQueueEntryRemovalBranch(p);
  } catch (err) {
    console.error("Error updating queue:", err);
    toast.error("An unexpected error occurred", {
      description: "Please try again.",
    });
    return { ok: false };
  }
}
