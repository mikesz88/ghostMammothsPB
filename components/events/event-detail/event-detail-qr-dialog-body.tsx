import { Loader2 } from "lucide-react";
import Image from "next/image";

export function EventDetailQrDialogBody({ queueLink }: { queueLink: string }) {
  return (
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
  );
}
