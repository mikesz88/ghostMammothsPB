"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Header } from "@/components/ui/header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const { resetPasswordForEmail } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: resetError } = await resetPasswordForEmail(email.trim());
    setLoading(false);

    if (resetError) {
      setError(resetError.message ?? "Something went wrong. Please try again.");
      return;
    }

    setSent(true);
  };

  return (
    <div className="flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        <h1 className="sr-only">Reset password</h1>
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Forgot password</CardTitle>
            <CardDescription>
              Enter your email and we&apos;ll send you a link to choose a new
              password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="space-y-4">
                <div className="p-3 text-sm text-green-700 bg-green-50 dark:text-green-200 dark:bg-green-950 rounded-md">
                  If an account exists for that address, you&apos;ll receive an
                  email with a reset link shortly. Check your spam folder if you
                  don&apos;t see it.
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/login">Back to sign in</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-destructive-foreground bg-destructive rounded-md">
                    {error}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending..." : "Send reset link"}
                </Button>
                <div className="text-center text-sm text-muted-foreground">
                  <Link href="/login" className="text-primary hover:underline">
                    Back to sign in
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ForgotPasswordForm />
    </div>
  );
}
