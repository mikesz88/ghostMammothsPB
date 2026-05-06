import { EventDetailQrCopyButton } from "@/components/events/event-detail-qr-copy-button";
import { DialogFooter } from "@/components/ui/dialog";

export function EventDetailQrDialogFooter({
  queueLink,
}: {
  queueLink: string;
}) {
  return (
    <DialogFooter>
      <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
        <EventDetailQrCopyButton queueLink={queueLink} />
      </div>
    </DialogFooter>
  );
}
