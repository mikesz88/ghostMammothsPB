"use client";

import { AdminDashboardPageClientChrome } from "@/components/admin/dashboard/admin-dashboard-page-client-chrome";
import { AdminDashboardPageClientModalsStack } from "@/components/admin/dashboard/admin-dashboard-page-client-modals-stack";
import { AdminDashboardPageContent } from "@/components/admin/dashboard/admin-dashboard-page-content";
import { useAdminDashboardPageClientState } from "@/lib/hooks/use-admin-dashboard-page-client-state";

type ClientState = ReturnType<typeof useAdminDashboardPageClientState>;

export function AdminDashboardPageClientView(s: ClientState) {
  return (
    <div className="min-h-screen bg-background">
      <AdminDashboardPageClientChrome>
        <AdminDashboardPageContent
          events={s.events}
          onCreateClick={() => s.setShowCreateDialog(true)}
          onEdit={s.setEditingEvent}
          onDelete={s.handleDeleteEvent}
          onEnd={s.handleEndEvent}
        />
      </AdminDashboardPageClientChrome>
      <AdminDashboardPageClientModalsStack
        showCreateDialog={s.showCreateDialog}
        setShowCreateDialog={s.setShowCreateDialog}
        editingEvent={s.editingEvent}
        setEditingEvent={s.setEditingEvent}
        handleCreate={s.handleCreate}
        handleUpdate={s.handleUpdate}
      />
    </div>
  );
}
