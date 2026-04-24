import { EventDetailQrDialogFrame } from "@/components/events/event-detail-qr-dialog-frame";
import { Dialog } from "@/components/ui/dialog";

export function EventDetailQrDialog({
  open,
  onOpenChange,
  queueLink,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  queueLink: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <EventDetailQrDialogFrame queueLink={queueLink} />
    </Dialog>
  );
}
