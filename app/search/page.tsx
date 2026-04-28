import { SearchPageClient } from "@/components/search/search-page-client";
import { SiteHeader } from "@/components/ui/header/site-header";
import { loadHomeAuthSnapshot } from "@/lib/marketing/load-home-auth-snapshot";

export default async function SearchPage() {
  const serverSnapshot = await loadHomeAuthSnapshot();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader authFromParent={{ snapshot: serverSnapshot }} />
      <SearchPageClient />
    </div>
  );
}
