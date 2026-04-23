"use client";

import { toast } from "sonner";

import { toggleAdminStatus, deleteUser } from "@/app/actions/admin-users";

async function toggleAdminThenRefresh(
  userId: string,
  newStatus: boolean,
  refresh: () => void,
) {
  const { error } = await toggleAdminStatus(userId, newStatus);
  if (error) {
    toast.error("Failed to update admin status", { description: error });
    return;
  }
  toast.success("Admin status updated successfully!");
  refresh();
}

async function deleteUserThenRefresh(userId: string, refresh: () => void) {
  const { error } = await deleteUser(userId);
  if (error) {
    toast.error("Failed to delete user", { description: error });
    return;
  }
  toast.success("User deleted successfully!");
  refresh();
}

export function toastConfirmToggleAdmin(
  userId: string,
  newStatus: boolean,
  refreshFromServer: () => void,
) {
  toast(
    newStatus
      ? "Grant admin access to this user?"
      : "Remove admin access from this user?",
    {
      description: newStatus
        ? "This user will have full admin privileges."
        : "This user will lose admin privileges.",
      action: {
        label: newStatus ? "Grant Access" : "Remove Access",
        onClick: () => {
          void toggleAdminThenRefresh(userId, newStatus, refreshFromServer);
        },
      },
      cancel: { label: "Cancel", onClick: () => {} },
    },
  );
}

export function toastConfirmDeleteUser(
  userId: string,
  userName: string,
  refreshFromServer: () => void,
) {
  toast(`Delete ${userName}?`, {
    description:
      "This will remove all their queue entries and cannot be undone.",
    action: {
      label: "Delete",
      onClick: () => {
        void deleteUserThenRefresh(userId, refreshFromServer);
      },
    },
    cancel: { label: "Cancel", onClick: () => {} },
  });
}
