"use client";

/**
 * Uses full-page navigation (`window.location`) so middleware, cookies, and
 * the RSC tree all refresh together after sign-in. Client-only
 * `router.replace` can race session visibility right after `signInWithPassword`.
 */

import { PENDING_MEMBERSHIP_TIER_STORAGE_KEY } from "@/lib/constants";
import { getUserMembership } from "@/lib/membership-helpers";
import { createClient } from "@/lib/supabase/client";

import type { User } from "@supabase/supabase-js";

function hrefWhenPendingTier(pendingTier: string) {
  return `/signup?flow=confirm-email&tier=${pendingTier}`;
}

async function navigateForAuthenticatedUser(user: User) {
  const membership = await getUserMembership(user.id);
  const hasActivePaidMembership = membership.isPaid && membership.isActive;

  if (hasActivePaidMembership) {
    window.localStorage.removeItem(PENDING_MEMBERSHIP_TIER_STORAGE_KEY);
    window.location.href = "/events";
    return;
  }

  const pendingTier = window.localStorage.getItem(
    PENDING_MEMBERSHIP_TIER_STORAGE_KEY,
  );

  if (pendingTier) {
    window.location.href = hrefWhenPendingTier(pendingTier);
    return;
  }

  window.location.href = "/membership";
}

export async function runAfterSignInNavigation(): Promise<void> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/membership";
      return;
    }

    await navigateForAuthenticatedUser(user);
  } catch (redirectError) {
    console.error("Post-login redirect error:", redirectError);
    window.location.href = "/membership";
  }
}
