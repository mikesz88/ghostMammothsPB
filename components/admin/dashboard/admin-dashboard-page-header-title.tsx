import Link from "next/link";

import { Button } from "@/components/ui/button";

export function AdminDashboardPageHeaderTitle() {
  return (
    <div>
      <h1 className="text-4xl font-bold text-foreground mb-2">
        Event Management
      </h1>
      <p className="text-muted-foreground">
        Create and manage pickleball events
      </p>
      <Button variant="link" className="h-auto p-0 mt-1 text-primary" asChild>
        <Link href="/admin/faq">Host help & FAQ</Link>
      </Button>
    </div>
  );
}
