"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Crown,
  CreditCard,
  Calendar,
  AlertCircle,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Header } from "@/components/ui/header";
import { useAuth } from "@/lib/auth-context";
import {
  getUserMembership,
  formatPrice,
  getMembershipBadgeVariant,
} from "@/lib/membership-helpers";
import type { UserMembershipInfo } from "@/lib/membership-helpers";

export default function MembershipSettingsPage() {
  const { user } = useAuth();
  const [membership, setMembership] = useState<UserMembershipInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchMembership();
  }, [user]);

  const fetchMembership = async () => {
    if (user) {
      setLoading(true);
      const info = await getUserMembership(user.id);
      setMembership(info);
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (
      !confirm(
        "Are you sure you want to cancel your membership? You'll continue to have access until the end of your billing period."
      )
    ) {
      return;
    }

    setActionLoading(true);

    try {
      const response = await fetch("/api/stripe/cancel-subscription", {
        method: "POST",
      });

      const { error } = await response.json();

      if (error) {
        alert(`Failed to cancel subscription: ${error}`);
      } else {
        alert(
          "Subscription cancelled successfully. You'll have access until the end of your billing period."
        );
        await fetchMembership();
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      alert("An unexpected error occurred. Please try again.");
    }

    setActionLoading(false);
  };

  const handleReactivateSubscription = async () => {
    setActionLoading(true);

    try {
      const response = await fetch("/api/stripe/reactivate-subscription", {
        method: "POST",
      });

      const { error } = await response.json();

      if (error) {
        alert(`Failed to reactivate subscription: ${error}`);
      } else {
        alert("Subscription reactivated successfully!");
        await fetchMembership();
      }
    } catch (error) {
      console.error("Error reactivating subscription:", error);
      alert("An unexpected error occurred. Please try again.");
    }

    setActionLoading(false);
  };

  const handleManageBilling = async () => {
    setActionLoading(true);

    try {
      const response = await fetch("/api/stripe/create-portal-session", {
        method: "POST",
      });

      const { url, error } = await response.json();

      if (error) {
        alert(`Failed to open billing portal: ${error}`);
      } else if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Error opening billing portal:", error);
      alert("An unexpected error occurred. Please try again.");
    }

    setActionLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Sign In Required
              </h2>
              <p className="text-muted-foreground mb-6">
                Please sign in to manage your membership
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
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            <span className="text-muted-foreground">Loading membership...</span>
          </div>
        </div>
      </div>
    );
  }

  const monthlyPrice = 35;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Membership Settings
            </h1>
            <p className="text-muted-foreground">
              Manage your subscription and billing
            </p>
          </div>

          {/* Current Membership */}
          <Card className="border-border mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-foreground">
                    Current Membership
                  </CardTitle>
                  <CardDescription>
                    Your active subscription plan
                  </CardDescription>
                </div>
                <Badge variant={getMembershipBadgeVariant(membership!.status)}>
                  {membership!.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-4 border-b">
                <div>
                  <p className="font-medium text-foreground mb-1">Plan</p>
                  <p className="text-sm text-muted-foreground">
                    {membership!.tierName === "free"
                      ? "Free Member"
                      : "Monthly Member"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground">
                    {membership!.tierName === "free"
                      ? formatPrice(0)
                      : formatPrice(monthlyPrice)}
                  </p>
                  <p className="text-sm text-muted-foreground">/month</p>
                </div>
              </div>

              {membership!.isPaid && membership!.currentPeriodEnd && (
                <>
                  <div className="flex items-center justify-between py-4 border-b">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground mb-1">
                          {membership!.cancelAtPeriodEnd
                            ? "Cancels On"
                            : "Renews On"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {membership!.currentPeriodEnd.toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {membership!.cancelAtPeriodEnd && (
                    <Alert>
                      <AlertCircle className="w-4 h-4" />
                      <AlertDescription>
                        Your membership will cancel on{" "}
                        {membership!.currentPeriodEnd.toLocaleDateString()}.
                        You'll still have access until then.
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              )}

              <div className="flex gap-3 pt-4">
                {membership!.isPaid ? (
                  <>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleManageBilling}
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CreditCard className="w-4 h-4 mr-2" />
                      )}
                      Manage Billing
                    </Button>
                    {membership!.cancelAtPeriodEnd ? (
                      <Button
                        variant="default"
                        className="flex-1"
                        onClick={handleReactivateSubscription}
                        disabled={actionLoading}
                      >
                        Reactivate Membership
                      </Button>
                    ) : (
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={handleCancelSubscription}
                        disabled={actionLoading}
                      >
                        Cancel Membership
                      </Button>
                    )}
                  </>
                ) : (
                  <Button className="w-full" asChild>
                    <Link href="/membership">
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade to Monthly
                    </Link>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          {membership!.isPaid && (
            <Card className="border-border mb-6">
              <CardHeader>
                <CardTitle className="text-foreground">
                  Your Monthly Benefits
                </CardTitle>
                <CardDescription>
                  What's included in your membership
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span className="text-muted-foreground">
                      Free entry to all events
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span className="text-muted-foreground">
                      Priority queue position
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span className="text-muted-foreground">
                      Access to exclusive events
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span className="text-muted-foreground">
                      10% merchandise discount
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Payment History - Placeholder */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Payment History</CardTitle>
              <CardDescription>Your recent transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Payment history coming soon
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
