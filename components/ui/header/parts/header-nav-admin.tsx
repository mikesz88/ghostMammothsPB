import Link from "next/link";

export function HeaderAdminNav() {
  return (
    <nav className="flex items-center gap-4" aria-label="Admin navigation">
      <Link
        href="/events"
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        Events
      </Link>
      <Link href="/admin" className="text-foreground font-medium">
        Dashboard
      </Link>
      <Link
        href="/admin/users"
        className="text-muted-foreground hover:text-foreground transition-colors"
      >
        Users
      </Link>
    </nav>
  );
}
