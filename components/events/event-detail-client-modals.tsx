import { EventDetailQrDialog } from "@/components/events/event-detail-qr-dialog";
import { JoinQueueDialog } from "@/components/join-queue-dialog";

import type { useEventDetailClientView } from "@/lib/hooks/use-event-detail-client-view";

type View = ReturnType<typeof useEventDetailClientView>;

export function EventDetailClientModals({ v }: { v: View }) {
  return (
    <>
      <JoinQueueDialog
        open={v.showJoinDialog}
        onOpenChange={v.setShowJoinDialog}
        onJoin={v.handleJoinQueue}
        eventTeamSize={v.event.teamSize}
        rotationType={v.event.rotationType}
      />
      <EventDetailQrDialog
        open={v.showQrDialog}
        onOpenChange={v.setShowQrDialog}
        queueLink={v.queueLink}
      />
    </>
  );
}
