"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { resendQueueEmailFromLog } from "@/app/actions/notifications";

import type { EmailLogRow } from "@/lib/admin/email-stats-types";

function toastResendResult(success: boolean, error: unknown) {
  if (success) {
    toast.success("Email sent again");
    return;
  }
  toast.error(typeof error === "string" ? error : "Could not resend email");
}

export function useEmailStatsResend() {
  const router = useRouter();
  const [resendingId, setResendingId] = useState<string | null>(null);
  const handleResend = useCallback(
    async (log: EmailLogRow) => {
      setResendingId(log.id);
      try {
        const result = await resendQueueEmailFromLog(log.id);
        if (result.success) {
          toastResendResult(true, null);
          router.refresh();
        } else {
          toastResendResult(false, result.error);
        }
      } catch {
        toast.error("Could not resend email");
      } finally {
        setResendingId(null);
      }
    },
    [router],
  );
  return { resendingId, handleResend };
}
