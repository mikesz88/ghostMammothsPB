import Link from "next/link";

export function HeaderDefaultNav() {
  return (
    <nav className="flex items-center gap-4" aria-label="Main navigation">
      <Link
        href="/events"
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        Events
      </Link>
      <Link
        href="/membership"
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        Membership
      </Link>
      <Link
        href="/calendar"
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        Calendar
      </Link>
      <Link
        href="/about"
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        About
      </Link>
      <Link
        href="/sitemap"
        className="text-neutral-900 dark:text-neutral-100 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
      >
        Sitemap
      </Link>
      <Link
        href="/search"
        className="text-neutral-900 dark:text-neutral-100 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
      >
        Search
      </Link>
      <Link
        href="https://ghostmammoth.myshopify.com"
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Shop (opens in new window)"
      >
        Shop
      </Link>
    </nav>
  );
}
