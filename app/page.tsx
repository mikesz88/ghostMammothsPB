import { HomeHeroClient } from "@/components/marketing/home-hero-client";
import { HomePageBody } from "@/components/marketing/home-page-body";
import { SiteHeader } from "@/components/ui/header/site-header";
import { loadHomeAuthSnapshot } from "@/lib/marketing/load-home-auth-snapshot";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const initialAdminAccessDenied = error === "admin-access-required";
  const serverSnapshot = await loadHomeAuthSnapshot();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader authFromParent={{ snapshot: serverSnapshot }} />
      <HomeHeroClient
        initialAdminAccessDenied={initialAdminAccessDenied}
        serverSnapshot={serverSnapshot}
      />
      <HomePageBody />
    </div>
  );
}
