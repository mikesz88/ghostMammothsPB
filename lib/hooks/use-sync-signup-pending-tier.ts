"use client";

import { useEffect } from "react";

import { PENDING_MEMBERSHIP_TIER_STORAGE_KEY } from "@/lib/constants";

export function useSyncSignupPendingTier(
  flow: string | null,
  tier: string | null,
) {
  useEffect(() => {
    if (flow === "confirm-email" && tier) {
      window.localStorage.setItem(PENDING_MEMBERSHIP_TIER_STORAGE_KEY, tier);
    }
  }, [flow, tier]);
}
