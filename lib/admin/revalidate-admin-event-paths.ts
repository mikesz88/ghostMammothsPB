import "server-only";

import { revalidatePath } from "next/cache";

export function revalidateAfterEndOrDeleteEvent(eventId: string) {
  revalidatePath("/admin");
  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath(`/events/${eventId}`);
  revalidatePath("/events");
}

export function revalidateAfterAdminEventListChange() {
  revalidatePath("/admin");
  revalidatePath("/events");
}

export function revalidateAfterUpdateAdminEvent(eventId: string) {
  revalidatePath("/admin");
  revalidatePath(`/admin/events/${eventId}`);
  revalidatePath(`/events/${eventId}`);
  revalidatePath("/events");
}
