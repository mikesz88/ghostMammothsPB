"use client";

import { toast } from "sonner";

import {
  resetTestEvent,
  addDummyUsersToQueue,
  clearTestEvent,
  fillAllCourts,
  updateEventRotationType,
  updateEventTeamSize,
  updateEventCourtCount,
} from "@/app/actions/test-helpers";
import { teamSizeDisplayLabel } from "@/lib/events/event-display-labels";
import { maxJoinGroupSizeForEventTeamSize } from "@/lib/queue/max-join-group-size";

import type { RotationType } from "@/lib/types";

export async function flowResetTestEvent(eventId: string) {
  const result = await resetTestEvent(eventId);
  if (result.success) {
    toast.success("Test event reset!", {
      description: "Dummy users reloaded to queue",
    });
    setTimeout(() => window.location.reload(), 500);
  } else {
    toast.error(result.error || "Failed to reset event");
  }
}

export async function flowRotationTypeChange(
  eventId: string,
  newType: RotationType,
): Promise<boolean> {
  const result = await updateEventRotationType(eventId, newType);
  if (result.success) {
    toast.success(`Rotation type changed to ${newType}`, {
      description: "Takes effect on next game",
    });
    setTimeout(() => window.location.reload(), 500);
    return true;
  }
  toast.error("Failed to update rotation type", {
    description: typeof result.error === "string" ? result.error : undefined,
  });
  return false;
}

export async function flowTeamSizeChange(
  eventId: string,
  size: number,
): Promise<boolean> {
  const result = await updateEventTeamSize(eventId, size);
  if (result.success) {
    const sizeText = teamSizeDisplayLabel(size as 1 | 2 | 3 | 4);
    toast.success(`Team size changed to ${sizeText}`, {
      description: "Event updated for testing",
    });
    setTimeout(() => window.location.reload(), 500);
    return true;
  }
  toast.error("Failed to update team size", {
    description: typeof result.error === "string" ? result.error : undefined,
  });
  return false;
}

export async function flowCourtCountChange(
  eventId: string,
  count: number,
): Promise<boolean> {
  const result = await updateEventCourtCount(eventId, count);
  if (result.success) {
    toast.success(`Court count changed to ${count}`, {
      description: "Event updated for testing",
    });
    setTimeout(() => window.location.reload(), 500);
    return true;
  }
  toast.error("Failed to update court count");
  return false;
}

function toastGroupExceedsMaxJoin(addGroupSize: number, maxJoinSize: number) {
  toast.error(
    `Group size (${addGroupSize}) is too large for this event format (max ${maxJoinSize}).`,
  );
}

export async function flowAddDummyToQueue(
  eventId: string,
  addGroupSize: number,
  currentTeamSize: number,
  onQueueUpdated?: () => void | Promise<void>,
) {
  const maxJoin = maxJoinGroupSizeForEventTeamSize(currentTeamSize);
  if (addGroupSize > maxJoin) {
    toastGroupExceedsMaxJoin(addGroupSize, maxJoin);
    return;
  }
  const result = await addDummyUsersToQueue(eventId, 1, addGroupSize);
  if (result.success) {
    const groupText =
      addGroupSize === 1 ? "solo player" : `group of ${addGroupSize}`;
    toast.success(`Added ${groupText} to queue`);
    await onQueueUpdated?.();
  } else {
    toast.error(result.error || "Failed to add users");
  }
}

export async function flowClearTestEvent(eventId: string) {
  const result = await clearTestEvent(eventId);
  if (result.success) {
    toast.success("Event cleared", {
      description: "All queue and court assignments removed",
    });
    setTimeout(() => window.location.reload(), 500);
  } else {
    toast.error("Failed to clear event");
  }
}

export async function flowFillAllCourts(eventId: string) {
  const result = await fillAllCourts(eventId);
  if (result.success) {
    toast.success(`Filled ${result.courtsCreated} courts`);
    setTimeout(() => window.location.reload(), 500);
  } else {
    toast.error(result.error || "Failed to fill courts");
  }
}
