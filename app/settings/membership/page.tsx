"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Crown,
  Loader2,
  CreditCard,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { Header } from "@/components/ui/header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import {
  formatPrice,
  getMembershipBadgeVariant,
  getUserMembership,
  type UserMembershipInfo,
} from "@/lib/membership-helpers";
import { toast } from "sonner";

export default function MembershipSettingsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [membership, setMembership] = useState<UserMembershipInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    const fetchMembership = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const info = await getUserMembership(user.id);
        setMembership(info);
      } catch (error) {
        console.error("Failed to load membership info:", error);
        toast.error("Unable to load membership details.");
      } finally {
        setLoading(false);
      }
    };

    fetchMembership();
  }, [user]);

  const handleManageBilling = async () => {
    try {
      setPortalLoading(true);
      const response = await fetch("/api/stripe/create-portal-session", {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data?.error || "Failed to create portal session");
      }

      const { url } = await response.json();
      if (url) {
        if (typeof window !== "undefined") {
          window.location.href = url;
        } else {
          router.push(url);
        }
      } else {
        throw new Error("Portal URL not returned");
      }
    } catch (error) {
      console.error("Error launching billing portal:", error);
      toast.error("Unable to open billing portal. Please try again later.");
    } finally {
      setPortalLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center space-y-4">
              <h2 className="text-2xl font-bold text-foreground">
                Sign In Required
              </h2>
              <p className="text-muted-foreground">
                Please sign in to manage your membership.
              </p>
              <Button asChild className="w-full">
                <Link href="/login">Sign In</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin" />
            Loading membership details...
          </div>
        </div>
      </div>
    );
  }

  const nextBillingDate =
    membership?.currentPeriodEnd &&
    membership.currentPeriodEnd.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  const isActivePaid = membership?.isPaid && membership.isActive;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Membership Settings
            </h1>
            <p className="text-muted-foreground">
              View your subscription details and manage your billing.
            </p>
          </div>

          <Card className="border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl text-foreground">
                  {membership?.tierDisplayName || "Free Member"}
                </CardTitle>
                <CardDescription>
                  {membership?.tierBillingPeriod === "monthly"
                    ? "Monthly subscription"
                    : membership?.tierBillingPeriod === "annual"
                    ? "Annual subscription"
                    : "Free plan"}
                </CardDescription>
              </div>
              <Badge
                variant={
                  getMembershipBadgeVariant(
                    membership?.status || "free"
                  ) as "default" | "secondary" | "destructive" | "outline"
                }
                className="capitalize"
              >
                {membership?.status || "free"}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-3">
                <Crown className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Current Plan</p>
                  <p className="text-lg font-semibold text-foreground">
                    {membership?.tierDisplayName || "Free Member"}
                  </p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 rounded-lg border border-border p-4">
                  <CreditCard className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">Price</p>
                    <p className="font-medium text-foreground">
                      {membership?.isPaid
                        ? `${formatPrice(membership?.tierPrice || 0)} / ${
                            membership?.tierBillingPeriod === "monthly"
                              ? "month"
                              : membership?.tierBillingPeriod === "annual"
                              ? "year"
                              : membership?.tierBillingPeriod
                          }`
                        : "Free"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-border p-4">
                  <Calendar className="w-5 h-5 text-primary shrink-0" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {membership?.cancelAtPeriodEnd
                        ? "Access until"
                        : "Renews on"}
                    </p>
                    <p className="font-medium text-foreground">
                      {nextBillingDate || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {!isActivePaid && (
                <div className="flex items-start gap-3 rounded-lg border border-dashed border-border p-4 bg-muted/30">
                  <AlertCircle className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Upgrade to a paid membership to unlock unlimited event
                      access and priority queue status.
                    </p>
                    <Button asChild>
                      <Link href="/membership">Upgrade Membership</Link>
                    </Button>
                  </div>
                </div>
              )}

              {isActivePaid && (
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Manage your billing information, payment methods, and
                      cancel or renew your subscription from the portal.
                    </p>
                  </div>
                  <Button
                    onClick={handleManageBilling}
                    disabled={portalLoading}
                  >
                    {portalLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Opening Portal...
                      </>
                    ) : (
                      "Manage Billing"
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">
                Need help?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                If you have any questions about your membership or billing,
                reach out to us at{" "}
                <a
                  href="mailto:hello@ghostmammothspb.com"
                  className="text-primary underline"
                >
                  hello@ghostmammothspb.com
                </a>
                .
              </p>
              <p>
                You can also manage your membership plan and view available
                tiers on the{" "}
                <Link href="/membership" className="text-primary underline">
                  membership page
                </Link>
                .
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
