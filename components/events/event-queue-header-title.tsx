import Link from "next/link";

import { Button } from "@/components/ui/button";

export function EventQueueHeaderTitle() {
  return (
    <div className="space-y-2 min-w-0">
      <h2 className="text-2xl font-bold text-foreground">Queue</h2>
      <Button variant="outline" size="sm" className="w-fit shrink-0" asChild>
        <Link href="/faq#how-to-queue">How to queue up!</Link>
      </Button>
    </div>
  );
}
