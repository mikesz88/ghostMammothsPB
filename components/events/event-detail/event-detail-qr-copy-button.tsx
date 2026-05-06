"use client";

import { Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

export function EventDetailQrCopyButton({ queueLink }: { queueLink: string }) {
  return (
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
  );
}
