import Link from "next/link";

import { SiteHeader } from "@/components/ui/header/site-header";

const links = [
  { href: "/", label: "Home" },
  { href: "/events", label: "Events" },
  { href: "/calendar", label: "Calendar" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "How queuing works (FAQ)" },
  { href: "/membership", label: "Membership" },
  { href: "/search", label: "Search" },
  { href: "/login", label: "Login" },
  { href: "/signup", label: "Sign Up" },
  { href: "/settings", label: "Settings" },
  { href: "https://ghostmammoth.myshopify.com", label: "Shop (external)", external: true },
];

export default async function SitemapPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-foreground mb-2">Sitemap</h1>
        <p className="text-muted-foreground mb-8">
          Find all main pages and sections of Ghost Mammoth Pickleball.
        </p>
        <nav aria-label="Site map">
          <ul className="space-y-2">
            {links.map(({ href, label, external }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-primary hover:underline"
                  {...(external
                    ? {
                        target: "_blank",
                        rel: "noopener noreferrer",
                        "aria-label": `${label} (opens in new window)`,
                      }
                    : {})}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </main>
    </div>
  );
}
