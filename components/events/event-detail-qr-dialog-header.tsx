import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function EventDetailQrDialogHeader() {
  return (
    <DialogHeader>
      <DialogTitle>Queue QR Code</DialogTitle>
      <DialogDescription>
        Share this code with players to let them join the queue from their
        phones.
      </DialogDescription>
    </DialogHeader>
  );
}
