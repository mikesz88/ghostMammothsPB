import Link from "next/link";

export function LoginSignUpFooter() {
  return (
    <div className="mt-4 text-center text-sm text-muted-foreground">
      Don&apos;t have an account?{" "}
      <Link href="/signup" className="text-primary hover:underline">
        Sign up
      </Link>
    </div>
  );
}
