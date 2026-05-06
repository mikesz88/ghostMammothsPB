"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { useAuth } from "@/lib/auth-context";

async function deleteAccountRequest() {
  const response = await fetch("/api/account", { method: "DELETE" });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result?.success) {
    throw new Error(
      result?.error || "Failed to delete account. Please contact support.",
    );
  }
}

async function completeAccountDeletionAfterApi(
  signOut: () => Promise<void>,
  router: { push: (href: string) => void },
) {
  toast.success("Your account has been deleted.");
  await signOut();
  router.push("/");
}

function openDeleteAccountConfirmation(onConfirm: () => void) {
  const deleteToastId = toast.warning("Delete your account?", {
    description:
      "This will cancel any active memberships and permanently remove your data.",
    duration: Infinity,
    action: {
      label: "Delete",
      onClick: () => {
        toast.dismiss(deleteToastId);
        onConfirm();
      },
    },
    cancel: {
      label: "Cancel",
      onClick: () => {
        toast.dismiss(deleteToastId);
      },
    },
  });
}

function confirmThenRunDelete(
  deleteLoading: boolean,
  runDelete: () => Promise<void>,
) {
  if (deleteLoading) return;
  openDeleteAccountConfirmation(() => {
    void runDelete();
  });
}

export function useSettingsHubAccountDeletion() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [deleteLoading, setDeleteLoading] = useState(false);

  const runDelete = useCallback(async () => {
    try {
      setDeleteLoading(true);
      await deleteAccountRequest();
      await completeAccountDeletionAfterApi(signOut, router);
    } catch (error) {
      console.error("Failed to delete account:", error);
      toast.error(
        "We couldn't delete your account. Please try again or contact support.",
      );
    } finally {
      setDeleteLoading(false);
    }
  }, [router, signOut]);

  const handleDeleteAccount = useCallback(
    () => confirmThenRunDelete(deleteLoading, runDelete),
    [deleteLoading, runDelete],
  );

  return { deleteLoading, handleDeleteAccount };
}
