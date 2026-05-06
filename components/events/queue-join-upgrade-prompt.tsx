import Link from "next/link";

import { Button } from "@/components/ui/button";

export function QueueJoinUpgradePrompt({ joinReason }: { joinReason: string }) {
  return (
    <div className="flex flex-col items-end gap-2">
      <p className="text-sm text-muted-foreground">{joinReason}</p>
      <Button variant="default" asChild>
        <Link href="/membership">Upgrade Membership</Link>
      </Button>
    </div>
  );
}
