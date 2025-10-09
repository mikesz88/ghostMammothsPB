import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export const Header = () => {
  return (
    <header className="border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Image
            src="/icon-32x32.png"
            alt="Ghost Mammoths PB"
            width={32}
            height={32}
          />
          <span className="text-xl font-bold text-foreground">
            Ghost Mammoths PB
          </span>
        </div>
        <nav className="flex items-center gap-4">
          <Link
            href="/events"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Events
          </Link>
          <Link
            href="/about"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            About
          </Link>
          <Button variant="outline" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};
