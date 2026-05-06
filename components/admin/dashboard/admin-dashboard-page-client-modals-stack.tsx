"use client";

import { AdminDashboardCreateModal } from "@/components/admin/dashboard/admin-dashboard-create-modal";
import { AdminDashboardEditModal } from "@/components/admin/dashboard/admin-dashboard-edit-modal";
import { useAdminDashboardPageClientState } from "@/lib/hooks/use-admin-dashboard-page-client-state";

type ModalsSlice = Pick<
  ReturnType<typeof useAdminDashboardPageClientState>,
  | "showCreateDialog"
  | "setShowCreateDialog"
  | "editingEvent"
  | "setEditingEvent"
  | "handleCreate"
  | "handleUpdate"
>;

export function AdminDashboardPageClientModalsStack({
  showCreateDialog,
  setShowCreateDialog,
  editingEvent,
  setEditingEvent,
  handleCreate,
  handleUpdate,
}: ModalsSlice) {
  return (
    <>
      <AdminDashboardCreateModal
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreate={handleCreate}
      />
      {editingEvent ? (
        <AdminDashboardEditModal
          editingEvent={editingEvent}
          setEditingEvent={setEditingEvent}
          onUpdate={handleUpdate}
        />
      ) : null}
    </>
  );
}
