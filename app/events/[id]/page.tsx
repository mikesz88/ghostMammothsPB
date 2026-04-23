import { notFound } from "next/navigation";

import { EventDetailClient } from "@/components/events/event-detail-client";
import { loadEventDetailPageData } from "@/lib/events/event-detail-server";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadEventDetailPageData(id);
  if (!data) {
    notFound();
  }

  return (
    <EventDetailClient
      eventId={id}
      initialEvent={data.serializedEvent}
      initialAssignments={data.initialAssignments}
      initialAccess={data.initialAccess}
      initialIsAdmin={data.initialIsAdmin}
    />
  );
}
