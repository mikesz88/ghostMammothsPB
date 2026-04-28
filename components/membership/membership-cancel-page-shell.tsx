import { SiteHeader } from "@/components/ui/header/site-header";

import type { ReactNode } from "react";

export async function MembershipCancelPageShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <div className="container mx-auto px-4 py-20">{children}</div>
    </div>
  );
}
