import { AboutPageBody } from "@/components/marketing/about-page-body";
import { SiteHeader } from "@/components/ui/header/site-header";
import { loadHomeAuthSnapshot } from "@/lib/marketing/load-home-auth-snapshot";

export default async function AboutPage() {
  const serverSnapshot = await loadHomeAuthSnapshot();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader authFromParent={{ snapshot: serverSnapshot }} />
      <AboutPageBody serverSnapshot={serverSnapshot} />
    </div>
  );
}
