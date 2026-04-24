"use client";

import { toast } from "sonner";

import {
  postBillingPortalSessionRequest,
  postCancelSubscriptionRequest,
  postReactivateSubscriptionRequest,
} from "@/lib/membership/membership-settings-stripe-requests";

export async function runManageBillingFlow(
  setLoading: (v: boolean) => void,
) {
  setLoading(true);
  try {
    const { url, error, details } = await postBillingPortalSessionRequest();
    if (error) {
      console.error("Billing portal error:", { error, details });
      toast.error("Failed to open billing portal", {
        description: details || error,
      });
    } else if (url) {
      window.location.href = url;
    }
  } catch (error) {
    console.error("Error opening billing portal:", error);
    toast.error("An unexpected error occurred. Please try again.");
  } finally {
    setLoading(false);
  }
}

export async function runCancelMembershipFlow(
  refreshMembership: () => void,
) {
  try {
    const { error } = await postCancelSubscriptionRequest();
    if (error) {
      toast.error("Failed to cancel subscription", { description: error });
      return;
    }
    toast.success("Subscription cancelled successfully", {
      description:
        "You'll have access until the end of your billing period.",
    });
    refreshMembership();
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    toast.error("An unexpected error occurred. Please try again.");
  }
}

export async function runReactivateMembershipFlow(
  refreshMembership: () => void,
) {
  try {
    const { error } = await postReactivateSubscriptionRequest();
    if (error) {
      toast.error("Failed to reactivate subscription", {
        description: error,
      });
      return;
    }
    toast.success("Subscription reactivated successfully!");
    refreshMembership();
  } catch (error) {
    console.error("Error reactivating subscription:", error);
    toast.error("An unexpected error occurred. Please try again.");
  }
}

export function runReactivateWithUiLoading(
  refreshMembership: () => void,
  setLoading: (v: boolean) => void,
) {
  setLoading(true);
  void runReactivateMembershipFlow(refreshMembership).finally(() => {
    setLoading(false);
  });
}

export function showCancelMembershipConfirmationToast(
  onConfirm: () => Promise<void>,
  setLoading: (v: boolean) => void,
) {
  toast("Cancel your membership?", {
    description:
      "You'll continue to have access until the end of your billing period.",
    action: {
      label: "Cancel Membership",
      onClick: async () => {
        setLoading(true);
        try {
          await onConfirm();
        } finally {
          setLoading(false);
        }
      },
    },
    cancel: {
      label: "Keep Membership",
      onClick: () => {},
    },
  });
}
