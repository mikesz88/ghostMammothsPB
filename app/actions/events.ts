"use server";

import {
  adminDbInsertDashboardEvent,
  adminDbUpdateDashboardEvent,
} from "@/lib/admin/admin-dashboard-upsert-event-db";
import { requireAdminServiceDb } from "@/lib/admin/require-admin-service-db";
import {
  revalidateAfterAdminEventListChange,
  revalidateAfterEndOrDeleteEvent,
  revalidateAfterUpdateAdminEvent,
} from "@/lib/admin/revalidate-admin-event-paths";
import { runDeleteAdminDashboardEvent } from "@/lib/admin/run-delete-admin-dashboard-event";
import { runEndAdminDashboardEvent } from "@/lib/admin/run-end-admin-dashboard-event";
import { runCreateEventFromFormData } from "@/lib/events/create-event-from-form-data";
import {
  fetchActiveEventsWithCounts,
  fetchEventRowById,
} from "@/lib/events/fetch-events-for-actions";

import type { AdminDashboardEventUpsertPayload } from "@/lib/admin/admin-dashboard-event-upsert";

export async function endAdminDashboardEvent(eventId: string) {
  const gate = await requireAdminServiceDb();
  if (gate.error || !gate.db) {
    return {
      success: false as const,
      error: gate.error ?? "Server configuration error",
    };
  }
  const err = await runEndAdminDashboardEvent(gate.db, eventId);
  if (err) return { success: false as const, error: err };
  revalidateAfterEndOrDeleteEvent(eventId);
  return { success: true as const, error: null as null };
}

export async function deleteAdminDashboardEvent(eventId: string) {
  const gate = await requireAdminServiceDb();
  if (gate.error || !gate.db) {
    return {
      success: false as const,
      error: gate.error ?? "Server configuration error",
    };
  }
  const err = await runDeleteAdminDashboardEvent(gate.db, eventId);
  if (err) return { success: false as const, error: err };
  revalidateAfterEndOrDeleteEvent(eventId);
  return { success: true as const, error: null as null };
}

export async function createAdminDashboardEvent(
  payload: AdminDashboardEventUpsertPayload,
) {
  const gate = await requireAdminServiceDb();
  if (gate.error || !gate.db) {
    return {
      success: false as const,
      error: gate.error ?? "Server configuration error",
    };
  }
  const err = await adminDbInsertDashboardEvent(gate.db, payload);
  if (err) return { success: false as const, error: err };
  revalidateAfterAdminEventListChange();
  return { success: true as const, error: null as null };
}

export async function updateAdminDashboardEvent(
  eventId: string,
  payload: AdminDashboardEventUpsertPayload,
) {
  const gate = await requireAdminServiceDb();
  if (gate.error || !gate.db) {
    return {
      success: false as const,
      error: gate.error ?? "Server configuration error",
    };
  }
  const err = await adminDbUpdateDashboardEvent(gate.db, eventId, payload);
  if (err) return { success: false as const, error: err };
  revalidateAfterUpdateAdminEvent(eventId);
  return { success: true as const, error: null as null };
}

export async function getEvents() {
  return fetchActiveEventsWithCounts();
}

export async function getEvent(id: string) {
  return fetchEventRowById(id);
}

export async function createEvent(formData: FormData) {
  return runCreateEventFromFormData(formData);
}
