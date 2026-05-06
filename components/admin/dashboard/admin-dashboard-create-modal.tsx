"use client";

import { CreateEventDialog } from "@/components/create-event-dialog";

import type { Event } from "@/lib/types";

export function AdminDashboardCreateModal({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (
    event: Omit<Event, "id" | "createdAt" | "updatedAt">,
  ) => void | Promise<void>;
}) {
  return (
    <CreateEventDialog
      open={open}
      onOpenChange={onOpenChange}
      onCreate={onCreate}
    />
  );
}
