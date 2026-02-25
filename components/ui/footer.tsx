import Link from "next/link";

export function Footer() {
  return (
    <footer
      className="border-t border-border bg-muted/50 py-6"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="container mx-auto px-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
        <Link href="/sitemap" className="hover:text-foreground transition-colors">
          Sitemap
        </Link>
        <Link href="/search" className="hover:text-foreground transition-colors">
          Search
        </Link>
      </div>
    </footer>
  );
}
