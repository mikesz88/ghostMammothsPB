import { EventsPageClient } from "@/components/events/events-page-client";
import { SiteHeader } from "@/components/ui/header/site-header";
import { loadActiveEventsListData } from "@/lib/events/load-active-events-list-data";
import { loadHomeAuthSnapshot } from "@/lib/marketing/load-home-auth-snapshot";

export default async function EventsPage() {
  const [initialSerializedEvents, serverSnapshot] = await Promise.all([
    loadActiveEventsListData(),
    loadHomeAuthSnapshot(),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader authFromParent={{ snapshot: serverSnapshot }} />
      <EventsPageClient
        initialSerializedEvents={initialSerializedEvents}
        serverSnapshot={serverSnapshot}
      />
    </div>
  );
}
