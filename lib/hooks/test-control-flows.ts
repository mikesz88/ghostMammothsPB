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
import { adminTeamSizeShortLabel } from "@/lib/admin/admin-assign-next-copy";
import { teamSizeDisplayLabel } from "@/lib/events/event-display-labels";

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

function toastGroupExceedsTeamSize(addGroupSize: number, currentTeamSize: number) {
  const mode = adminTeamSizeShortLabel(currentTeamSize);
  toast.error(
    `Group size (${addGroupSize}) cannot exceed team size (${currentTeamSize})`,
    { description: `For ${mode}, max group size is ${currentTeamSize}` },
  );
}

export async function flowAddDummyToQueue(
  eventId: string,
  addGroupSize: number,
  currentTeamSize: number,
  onQueueUpdated?: () => void | Promise<void>,
) {
  if (addGroupSize > currentTeamSize) {
    toastGroupExceedsTeamSize(addGroupSize, currentTeamSize);
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
