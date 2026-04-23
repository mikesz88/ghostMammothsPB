"use client";

import { toast } from "sonner";

import { joinQueue } from "@/app/actions/queue";
import { courtAssignmentIncludesUser } from "@/lib/events/court-assignment-utils";
import { isActiveQueueStatus } from "@/lib/hooks/event-detail-queue-handlers-types";

import type {
  JoinPlayer,
  SendNotification,
} from "@/lib/hooks/event-detail-queue-handlers-types";
import type { CourtAssignment, QueueEntry } from "@/lib/types";
import type { User as SupabaseAuthUser } from "@supabase/supabase-js";

function joinFailsAlreadyInQueue(user: SupabaseAuthUser, queue: QueueEntry[]) {
  const hit = queue.find(
    (e) =>
      e.userId === user.id &&
      (isActiveQueueStatus(e.status) || e.status === "playing"),
  );
  if (!hit) return false;
  toast.error("Already in queue", {
    description: "You're already in the queue for this event.",
  });
  return true;
}

function joinFailsAlreadyPlaying(
  user: SupabaseAuthUser,
  assignments: CourtAssignment[],
) {
  const playing = assignments.some(
    (a) => !a.endedAt && courtAssignmentIncludesUser(a, user.id),
  );
  if (!playing) return false;
  toast.error("Already playing", {
    description:
      "You're currently playing on a court. Finish your game first.",
  });
  return true;
}

export function joinQueuePrecheckFails(
  user: SupabaseAuthUser,
  queue: QueueEntry[],
  assignments: CourtAssignment[],
) {
  return (
    joinFailsAlreadyInQueue(user, queue) ||
    joinFailsAlreadyPlaying(user, assignments)
  );
}

type AfterJoinArgs = {
  groupSize: number;
  waitingCount: number;
  eventName: string;
  refetchQueue: () => Promise<void>;
  setShowJoinDialog: (open: boolean) => void;
  sendNotification: SendNotification;
};

async function postJoinQueueSuccess(a: AfterJoinArgs) {
  a.setShowJoinDialog(false);
  await a.refetchQueue();
  const groupText = a.groupSize > 1 ? ` as a group of ${a.groupSize}` : "";
  a.sendNotification("queue-join", "Successfully Joined Queue", {
    body: `You're now in position #${a.waitingCount + 1}${groupText} for ${a.eventName}`,
    tag: "queue-join",
  });
}

async function callJoinQueueRpc(
  eventId: string,
  user: SupabaseAuthUser,
  groupSize: number,
  players: JoinPlayer[],
) {
  const groupId = groupSize > 1 ? crypto.randomUUID() : undefined;
  return joinQueue(eventId, user.id, groupSize, groupId, players);
}

type SubmitJoinParams = {
  eventId: string;
  user: SupabaseAuthUser;
  groupSize: number;
  players: JoinPlayer[];
  refetchQueue: () => Promise<void>;
  setShowJoinDialog: (open: boolean) => void;
  waitingCount: number;
  eventName: string;
  sendNotification: SendNotification;
};

async function tryJoinQueueRequest(p: SubmitJoinParams) {
  const { error } = await callJoinQueueRpc(
    p.eventId,
    p.user,
    p.groupSize,
    p.players,
  );
  if (error) {
    console.error("Error joining queue:", error);
    toast.error("Failed to join queue", { description: "Please try again." });
    return;
  }
  await postJoinQueueSuccess({
    groupSize: p.groupSize,
    waitingCount: p.waitingCount,
    eventName: p.eventName,
    refetchQueue: p.refetchQueue,
    setShowJoinDialog: p.setShowJoinDialog,
    sendNotification: p.sendNotification,
  });
}

export async function submitJoinQueueAndNotify(p: SubmitJoinParams) {
  try {
    await tryJoinQueueRequest(p);
  } catch (err) {
    console.error("Error joining queue:", err);
    toast.error("An unexpected error occurred", { description: "Please try again." });
  }
}

export async function runJoinQueueHandler(
  p: import("@/lib/hooks/event-detail-queue-handlers-types").EventDetailQueueHandlersParams,
  players: JoinPlayer[],
  groupSize: number,
) {
  if (!p.user) return;
  if (joinQueuePrecheckFails(p.user, p.queue, p.assignments)) return;
  await submitJoinQueueAndNotify({
    eventId: p.eventId,
    user: p.user,
    groupSize,
    players,
    refetchQueue: p.refetchQueue,
    setShowJoinDialog: p.setShowJoinDialog,
    waitingCount: p.waitingCount,
    eventName: p.event.name,
    sendNotification: p.sendNotification,
  });
}
