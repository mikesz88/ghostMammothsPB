"use client";

import { toast } from "sonner";

import {
  is2Stay2OffRotation,
  is2Stay2OffValidTeamSize,
} from "@/lib/rotation-policy";

import type { Event } from "@/lib/types";

export function toastIfInvalid2Stay2Off(
  eventData: Omit<Event, "id" | "createdAt" | "updatedAt">,
): boolean {
  if (
    is2Stay2OffRotation(eventData.rotationType) &&
    !is2Stay2OffValidTeamSize(eventData.teamSize)
  ) {
    toast.error("2 Stay 2 Off requires doubles (team size 2).");
    return false;
  }
  return true;
}
