"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import {
  runCancelMembershipFlow,
  runManageBillingFlow,
  runReactivateWithUiLoading,
  showCancelMembershipConfirmationToast,
} from "@/lib/hooks/settings-membership-page-flows";

export function useSettingsMembershipPageActions() {
  const router = useRouter();
  const [actionLoading, setActionLoading] = useState(false);
  const refreshMembership = useCallback(() => router.refresh(), [router]);

  const handleManageBilling = useCallback(() => {
    void runManageBillingFlow(setActionLoading);
  }, []);

  const handleCancelSubscription = useCallback(() => {
    showCancelMembershipConfirmationToast(
      () => runCancelMembershipFlow(refreshMembership),
      setActionLoading,
    );
  }, [refreshMembership]);

  const handleReactivateSubscription = useCallback(() => {
    runReactivateWithUiLoading(refreshMembership, setActionLoading);
  }, [refreshMembership]);

  return {
    actionLoading,
    handleCancelSubscription,
    handleReactivateSubscription,
    handleManageBilling,
  };
}
