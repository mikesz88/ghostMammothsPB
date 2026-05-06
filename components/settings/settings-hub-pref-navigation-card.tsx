import Link from "next/link";

import { SettingsHubPrefNavigationCardInner } from "@/components/settings/settings-hub-pref-navigation-card-inner";

import type { ReactNode } from "react";


export function SettingsHubPrefNavigationCard({
  href,
  title,
  description,
  icon,
}: {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <Link href={href}>
      <SettingsHubPrefNavigationCardInner
        title={title}
        description={description}
        icon={icon}
      />
    </Link>
  );
}
