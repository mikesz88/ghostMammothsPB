import { Header } from "@/components/ui/header";

import type { ReactNode } from "react";


export function SettingsNotificationsPageShell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Header backButton={{ href: "/settings", label: "Back to Settings" }} />
      <div className="container mx-auto px-4 py-12 max-w-3xl">{children}</div>
    </div>
  );
}
