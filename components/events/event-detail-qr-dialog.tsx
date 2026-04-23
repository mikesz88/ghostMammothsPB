"use client";

import { Copy, Loader2 } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Queue QR Code</DialogTitle>
          <DialogDescription>
            Share this code with players to let them join the queue from their
            phones.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          {queueLink ? (
            <Image
              src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
                queueLink,
              )}`}
              alt="Queue QR code"
              width={240}
              height={240}
              className="rounded-md border border-border"
              unoptimized
            />
          ) : (
            <Loader2 className="w-6 h-6 animate-spin" />
          )}
          <div className="w-full break-all rounded-md border border-dashed border-muted-foreground/40 bg-muted/30 p-3 text-center text-xs text-muted-foreground">
            {queueLink || "Generating link..."}
          </div>
        </div>
        <DialogFooter>
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={async () => {
                if (!queueLink) return;
                try {
                  await navigator.clipboard.writeText(queueLink);
                  toast.success("Queue link copied to clipboard");
                } catch (err) {
                  console.error("Failed to copy queue link:", err);
                  toast.error("Unable to copy link");
                }
              }}
            >
              <Copy className="w-4 h-4 mr-2" /> Copy Link
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
