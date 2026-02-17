"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Check, Crown, Zap, Shield, Gift, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Header } from "@/components/ui/header";
import { useAuth } from "@/lib/auth-context";
import { getUserMembership, formatPrice } from "@/lib/membership-helpers";
import { createClient } from "@/lib/supabase/client";
import type { UserMembershipInfo } from "@/lib/membership-helpers";

interface MembershipTier {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  price: number;
  billing_period: string;
  stripe_price_id: string | null;
  features: {
    event_access?: string;
    priority_queue?: boolean;
    exclusive_events?: boolean;
    merchandise_discount?: number;
  };
  is_active: boolean;
  sort_order: number;
}

export default function MembershipPage() {
  const { user } = useAuth();
  const [membership, setMembership] = useState<UserMembershipInfo | null>(null);
  const [tiers, setTiers] = useState<MembershipTier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch membership tiers from database
      const supabase = createClient();
      const { data: tiersData, error: tiersError } = await supabase
        .from("membership_tiers")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

      if (!tiersError && tiersData) {
        setTiers(tiersData as MembershipTier[]);
      }

      // Fetch user's current membership
      if (user) {
        const info = await getUserMembership(user.id);
        setMembership(info);
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  const isCurrentlyFree = !membership?.isPaid;
  const currentTierName = membership?.tierName || "free";

  // Helper function to check if a tier is the user's current plan
  const isCurrentPlan = (tierName: string) => currentTierName === tierName;

  // Get the monthly tier for the value proposition section
  const monthlyTier = tiers.find((t) => t.billing_period === "monthly");

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            <span className="text-muted-foreground">
              Loading membership plans...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Choose Your Membership
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock unlimited event access with our monthly membership
          </p>
        </div>

        {/* Current Membership Status */}
        {user && membership && (
          <div className="max-w-2xl mx-auto mb-8">
            <Card className="border-primary bg-primary/5">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Current Plan
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {tiers.find((t) => t.name === currentTierName)
                        ?.display_name || "Unknown Plan"}
                    </p>
                    {membership.isPaid && membership.currentPeriodEnd && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {membership.cancelAtPeriodEnd
                          ? `Cancels on ${membership.currentPeriodEnd.toLocaleDateString()}`
                          : `Renews on ${membership.currentPeriodEnd.toLocaleDateString()}`}
                      </p>
                    )}
                  </div>
                  {membership.isPaid && (
                    <Badge variant="default">
                      <Crown className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {tiers.map((tier) => {
            const isCurrent = isCurrentPlan(tier.name);
            const isPaidTier = tier.price > 0;

            return (
              <Card
                key={tier.id}
                className={`border-2 ${
                  isCurrent ? "border-primary bg-primary/5" : "border-border"
                } relative`}
              >
                {isCurrent && isPaidTier && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      <Crown className="w-3 h-3 mr-1" />
                      Current Plan
                    </Badge>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-2xl">
                      {tier.display_name}
                    </CardTitle>
                    {isCurrent && !isPaidTier && (
                      <Badge variant="outline">Current Plan</Badge>
                    )}
                    {isPaidTier &&
                      tier.billing_period === "monthly" &&
                      !isCurrent && <Badge variant="default">Popular</Badge>}
                  </div>
                  <CardDescription>{tier.description || ""}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <p className="text-4xl font-bold text-foreground">
                      {formatPrice(tier.price)}
                      <span className="text-lg font-normal text-muted-foreground">
                        /
                        {tier.billing_period === "free"
                          ? "forever"
                          : tier.billing_period}
                      </span>
                    </p>
                    {isPaidTier && tier.billing_period === "monthly" && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Cancel anytime
                      </p>
                    )}
                  </div>

                  <ul className="space-y-3">
                    {/* Event Access */}
                    {tier.features?.event_access === "unlimited" && (
                      <li className="flex items-start gap-2">
                        <Zap className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="font-medium text-foreground">
                          Free entry to ALL events
                        </span>
                      </li>
                    )}
                    {tier.features?.event_access === "pay_per_event" && (
                      <>
                        <li className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">
                            Can join free events
                          </span>
                        </li>
                        <li className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-muted-foreground">
                            Pay per paid event
                          </span>
                        </li>
                      </>
                    )}

                    {/* Priority Queue */}
                    {tier.features?.priority_queue && (
                      <li className="flex items-start gap-2">
                        <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">
                          Priority queue position
                        </span>
                      </li>
                    )}

                    {/* Exclusive Events */}
                    {tier.features?.exclusive_events && (
                      <li className="flex items-start gap-2">
                        <Crown className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">
                          Access to exclusive events
                        </span>
                      </li>
                    )}

                    {/* Merchandise Discount */}
                    {tier.features?.merchandise_discount && (
                      <li className="flex items-start gap-2">
                        <Gift className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">
                          {tier.features.merchandise_discount}% discount on
                          merchandise
                        </span>
                      </li>
                    )}

                    {/* Always show basic features */}
                    {!isPaidTier && (
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">
                          Basic queue features
                        </span>
                      </li>
                    )}
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">
                        Email notifications
                        {/* {isPaidTier
                          ? "SMS & email notifications"
                          : "Email notifications"} */}
                      </span>
                    </li>
                    {isPaidTier && (
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">
                          Support local pickleball community
                        </span>
                      </li>
                    )}
                  </ul>

                  {/* CTA Button */}
                  {user ? (
                    isCurrent ? (
                      <Button
                        variant="outline"
                        className="w-full"
                        size="lg"
                        disabled={!isPaidTier}
                        asChild={isPaidTier}
                      >
                        {isPaidTier ? (
                          <Link href="/settings/membership">
                            Manage Membership
                          </Link>
                        ) : (
                          <span>Current Plan</span>
                        )}
                      </Button>
                    ) : isPaidTier ? (
                      <Button className="w-full" size="lg" asChild>
                        <Link href={`/membership/checkout?tier=${tier.id}`}>
                          Upgrade to {tier.display_name}
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        className="w-full"
                        size="lg"
                        disabled
                      >
                        Downgrade to {tier.display_name}
                      </Button>
                    )
                  ) : (
                    <Button className="w-full" size="lg" asChild>
                      <Link href="/signup">
                        {isPaidTier ? "Sign Up to Upgrade" : "Sign Up Free"}
                      </Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Value Proposition */}
        {monthlyTier && (
          <div className="max-w-3xl mx-auto mt-16 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Why Go Monthly?
            </h2>
            <p className="text-muted-foreground mb-8">
              If you play more than 3 events per month, the monthly membership
              pays for itself!
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-border">
                <CardContent className="p-6 text-center">
                  <p className="text-3xl font-bold text-foreground mb-2">
                    Unlimited
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Events per month
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="p-6 text-center">
                  <p className="text-3xl font-bold text-foreground mb-2">
                    {formatPrice(monthlyTier.price)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Fixed monthly cost
                  </p>
                </CardContent>
              </Card>
              <Card className="border-border">
                <CardContent className="p-6 text-center">
                  <p className="text-3xl font-bold text-foreground mb-2">
                    Save
                  </p>
                  <p className="text-sm text-muted-foreground">
                    vs. paying per event
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* FAQ */}
        <div className="max-w-3xl mx-auto mt-16">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg">Can I cancel anytime?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Yes! You can cancel your membership at any time. You'll
                  continue to have access until the end of your current billing
                  period.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg">
                  What happens if I cancel?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Your membership will remain active until the end of your paid
                  period. After that, you'll revert to a free membership and can
                  still join events by paying per event.
                </p>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="text-lg">
                  How do I manage my membership?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Go to Settings → Membership to view your subscription details,
                  update payment methods, or cancel your membership.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
