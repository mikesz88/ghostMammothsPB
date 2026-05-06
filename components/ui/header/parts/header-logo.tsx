import Image from "next/image";
import Link from "next/link";

export function HeaderLogo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-1.5 sm:gap-2"
      aria-label="Ghost Mammoth PB home"
    >
      <Image
        src="/icon-32x32.png"
        alt=""
        width={32}
        height={32}
        className="w-6 h-6 sm:w-8 sm:h-8"
      />
      <span className="text-base sm:text-xl font-bold text-foreground truncate max-w-[140px] sm:max-w-none">
        Ghost Mammoth PB
      </span>
    </Link>
  );
}
