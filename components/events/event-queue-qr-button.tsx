import { QrCode } from "lucide-react";

import { Button } from "@/components/ui/button";

export function EventQueueQrButton({ onShowQrClick }: { onShowQrClick: () => void }) {
  return (
    <Button variant="outline" onClick={onShowQrClick}>
      <QrCode className="w-4 h-4 mr-2" />
      Show Queue QR
    </Button>
  );
}
