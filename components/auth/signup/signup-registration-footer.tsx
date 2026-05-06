import Link from "next/link";

export function SignupRegistrationFooter() {
  return (
    <div className="mt-4 text-center text-sm text-muted-foreground">
      Already have an account?{" "}
      <Link href="/login" className="text-primary hover:underline">
        Sign in
      </Link>
    </div>
  );
}
