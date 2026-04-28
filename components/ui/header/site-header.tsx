import { Header } from "@/components/ui/header/header-client";
import { HeaderAdminNav } from "@/components/ui/header/parts/header-nav-admin";
import { HeaderDefaultNav } from "@/components/ui/header/parts/header-nav-default";
import { createClient } from "@/lib/supabase/server";

import type {
  HeaderProps,
  HeaderServerSnapshot,
} from "@/components/ui/header/header-client";
import type { ReactNode } from "react";

export type SiteHeaderProps = HeaderProps & {
  /** Caller already resolved session + `is_admin` (avoids duplicate Supabase round-trips). */
  authFromParent?: { snapshot: HeaderServerSnapshot | null };
};

/**
 * Server-first site header: resolves session + `is_admin`, passes snapshot
 * into the client header. Desktop nav (when not `hideNav` / `customNav`) is
 * server-rendered and passed as `children`.
 */
export async function SiteHeader(props: SiteHeaderProps) {
  const { authFromParent, ...headerProps } = props;

  let serverSnapshot: HeaderProps["serverSnapshot"] = null;
  if (authFromParent !== undefined) {
    serverSnapshot = authFromParent.snapshot;
  } else {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from("users")
        .select("is_admin")
        .eq("id", user.id)
        .single();
      serverSnapshot = {
        userId: user.id,
        isAdmin: data?.is_admin ?? false,
      };
    }
  }

  const { variant = "default", hideNav = false, customNav } = headerProps;

  let navChild: ReactNode | undefined;
  if (hideNav || customNav) {
    navChild = undefined;
  } else if (variant === "admin") {
    navChild = <HeaderAdminNav />;
  } else {
    navChild = <HeaderDefaultNav />;
  }

  return (
    <Header {...headerProps} serverSnapshot={serverSnapshot}>
      {navChild}
    </Header>
  );
}
