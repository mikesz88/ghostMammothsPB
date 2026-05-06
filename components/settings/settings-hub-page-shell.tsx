import { Header } from "@/components/ui/header";

import type { ReactNode } from "react";


export function SettingsHubPageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">{children}</div>
      </div>
    </div>
  );
}
