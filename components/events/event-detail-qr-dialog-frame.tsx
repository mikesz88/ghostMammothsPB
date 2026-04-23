import { EventDetailQrDialogBody } from "@/components/events/event-detail-qr-dialog-body";
import { EventDetailQrDialogFooter } from "@/components/events/event-detail-qr-dialog-footer";
import { EventDetailQrDialogHeader } from "@/components/events/event-detail-qr-dialog-header";
import { DialogContent } from "@/components/ui/dialog";

export function EventDetailQrDialogFrame({
  queueLink,
}: {
  queueLink: string;
}) {
  return (
    <DialogContent>
      <EventDetailQrDialogHeader />
      <EventDetailQrDialogBody queueLink={queueLink} />
      <EventDetailQrDialogFooter queueLink={queueLink} />
    </DialogContent>
  );
}
