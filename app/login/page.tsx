"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth-context";
import { Header } from "@/components/ui/header";
import { createClient } from "@/lib/supabase/client";
import { getUserMembership } from "@/lib/membership-helpers";
import { PENDING_MEMBERSHIP_TIER_STORAGE_KEY } from "@/lib/constants";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const { signIn, user, loading: authLoading, resendVerificationEmail } =
    useAuth();
  const router = useRouter();

  const isEmailNotConfirmed =
    error?.toLowerCase().includes("email not confirmed") ?? false;
  const searchParams = useSearchParams();

  // Redirect if already logged in (e.g. from email confirmation callback)
  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/membership");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    const urlMessage = searchParams.get("message");
    if (urlMessage) {
      setMessage(urlMessage);
    }
  }, [searchParams]);

  const handleResendVerification = async () => {
    if (!email?.trim()) return;
    setResendLoading(true);
    setResendMessage(null);
    const { error: resendError } = await resendVerificationEmail(email.trim());
    setResendLoading(false);
    if (resendError) {
      setResendMessage(resendError.message ?? "Failed to resend email.");
    } else {
      setResendMessage("Verification email sent. Check your inbox and click the link.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResendMessage(null);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message);
      } else {
        try {
          const supabase = createClient();
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user) {
            window.location.href = "/membership";
            return;
          }

          const membership = await getUserMembership(user.id);
          const hasActivePaidMembership =
            membership.isPaid && membership.isActive;

          if (hasActivePaidMembership) {
            if (typeof window !== "undefined") {
              window.localStorage.removeItem(PENDING_MEMBERSHIP_TIER_STORAGE_KEY);
            }
            window.location.href = "/events";
            return;
          }

          let pendingTier: string | null = null;
          if (typeof window !== "undefined") {
            pendingTier = window.localStorage.getItem(
              PENDING_MEMBERSHIP_TIER_STORAGE_KEY
            );
          }

          if (pendingTier) {
            window.location.href = `/signup?flow=confirm-email&tier=${pendingTier}`;
          } else {
            window.location.href = "/membership";
          }
        } catch (redirectError) {
          console.error("Post-login redirect error:", redirectError);
          window.location.href = "/membership";
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to manage your queue and events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {message && (
                <div className="p-3 text-sm text-blue-700 bg-blue-50 dark:text-blue-200 dark:bg-blue-950 rounded-md">
                  {message}
                </div>
              )}
              {error && (
                <div className="space-y-2">
                  <div className="p-3 text-sm text-destructive-foreground bg-destructive rounded-md">
                    {error}
                  </div>
                  {isEmailNotConfirmed && (
                    <div className="space-y-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={handleResendVerification}
                        disabled={resendLoading}
                      >
                        {resendLoading
                          ? "Sending..."
                          : "Resend verification email"}
                      </Button>
                      {resendMessage && (
                        <div
                          className={`p-3 text-sm rounded-md ${
                            resendMessage.startsWith("Verification")
                              ? "text-green-700 bg-green-50 dark:text-green-200 dark:bg-green-950"
                              : "text-destructive-foreground bg-destructive/20"
                          }`}
                        >
                          {resendMessage}
                        </div>
                      )}
                    </div>
                  )}
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link href="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-4 py-12">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
