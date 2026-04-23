"use client";

import { useState } from "react";
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

export interface UseTestControlsArgs {
  eventId: string;
  currentRotationType: RotationType;
  currentTeamSize: number;
  currentCourtCount: number;
  onQueueUpdated?: () => void | Promise<void>;
}

export function useTestControls({
  eventId,
  currentRotationType,
  currentTeamSize,
  currentCourtCount,
  onQueueUpdated,
}: UseTestControlsArgs) {
  const [loading, setLoading] = useState(false);
  const [rotationType, setRotationType] =
    useState<RotationType>(currentRotationType);
  const [teamSize, setTeamSize] = useState<number>(currentTeamSize);
  const [courtCount, setCourtCount] = useState<number>(currentCourtCount);
  const [groupSize, setGroupSize] = useState<number>(1);

  const handleReset = async () => {
    setLoading(true);
    try {
      const result = await resetTestEvent(eventId);
      if (result.success) {
        toast.success("Test event reset!", {
          description: "Dummy users reloaded to queue",
        });
        setTimeout(() => window.location.reload(), 500);
      } else {
        toast.error(result.error || "Failed to reset event");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error resetting event");
    } finally {
      setLoading(false);
    }
  };

  const handleRotationChange = async (newType: RotationType) => {
    setRotationType(newType);
    try {
      const result = await updateEventRotationType(eventId, newType);
      if (result.success) {
        toast.success(`Rotation type changed to ${newType}`, {
          description: "Takes effect on next game",
        });
        setTimeout(() => window.location.reload(), 500);
      } else {
        setRotationType(currentRotationType);
        toast.error("Failed to update rotation type", {
          description:
            typeof result.error === "string" ? result.error : undefined,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating rotation type");
    }
  };

  const handleTeamSizeChange = async (newSize: string) => {
    const size = Number(newSize);
    setTeamSize(size);

    if (groupSize > size) {
      setGroupSize(size);
    }

    try {
      const result = await updateEventTeamSize(eventId, size);
      if (result.success) {
        const sizeText = teamSizeDisplayLabel(size as 1 | 2 | 3 | 4);
        toast.success(`Team size changed to ${sizeText}`, {
          description: "Event updated for testing",
        });
        setTimeout(() => window.location.reload(), 500);
      } else {
        setTeamSize(currentTeamSize);
        toast.error("Failed to update team size", {
          description:
            typeof result.error === "string" ? result.error : undefined,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating team size");
    }
  };

  const handleCourtCountChange = async (newCount: string) => {
    const count = Number(newCount);
    setCourtCount(count);
    try {
      const result = await updateEventCourtCount(eventId, count);
      if (result.success) {
        toast.success(`Court count changed to ${count}`, {
          description: "Event updated for testing",
        });
        setTimeout(() => window.location.reload(), 500);
      } else {
        toast.error("Failed to update court count");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating court count");
    }
  };

  const handleAddDummyToQueue = async (size?: number) => {
    setLoading(true);
    const addGroupSize = size || groupSize;

    if (addGroupSize > currentTeamSize) {
      const mode = adminTeamSizeShortLabel(currentTeamSize);
      toast.error(
        `Group size (${addGroupSize}) cannot exceed team size (${currentTeamSize})`,
        {
          description: `For ${mode}, max group size is ${currentTeamSize}`,
        },
      );
      setLoading(false);
      return;
    }

    try {
      const result = await addDummyUsersToQueue(eventId, 1, addGroupSize);
      if (result.success) {
        const groupText =
          addGroupSize === 1 ? "solo player" : `group of ${addGroupSize}`;
        toast.success(`Added ${groupText} to queue`);
        await onQueueUpdated?.();
      } else {
        toast.error(result.error || "Failed to add users");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error adding users");
    } finally {
      setLoading(false);
    }
  };

  const handleClearAll = async () => {
    setLoading(true);
    try {
      const result = await clearTestEvent(eventId);
      if (result.success) {
        toast.success("Event cleared", {
          description: "All queue and court assignments removed",
        });
        setTimeout(() => window.location.reload(), 500);
      } else {
        toast.error("Failed to clear event");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error clearing event");
    } finally {
      setLoading(false);
    }
  };

  const handleFillAllCourts = async () => {
    setLoading(true);
    try {
      const result = await fillAllCourts(eventId);
      if (result.success) {
        toast.success(`Filled ${result.courtsCreated} courts`);
        setTimeout(() => window.location.reload(), 500);
      } else {
        toast.error(result.error || "Failed to fill courts");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error filling courts");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    rotationType,
    teamSize,
    courtCount,
    groupSize,
    setGroupSize,
    handleReset,
    handleRotationChange,
    handleTeamSizeChange,
    handleCourtCountChange,
    handleAddDummyToQueue,
    handleClearAll,
    handleFillAllCourts,
    currentTeamSize,
  };
}
