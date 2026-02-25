import Link from "next/link";

export function Footer() {
  return (
    <footer
      className="border-t border-border bg-white dark:bg-zinc-900 py-6"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="container mx-auto px-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
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
      </div>
    </footer>
  );
}
