import { SiteHeader } from "@/components/ui/header/site-header";

import type { ReactNode } from "react";

export async function AuthPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      {children}
    </div>
  );
}
