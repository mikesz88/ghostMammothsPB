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
      const supabase = createClient();
      const { data: tiersData, error: tiersError } = await supabase
        .from("membership_tiers")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");

      if (!tiersError && tiersData) {
        setTiers(tiersData as MembershipTier[]);
      }

      if (user) {
        const info = await getUserMembership(user.id);
        setMembership(info);
      }

      setLoading(false);
    };

    fetchData();
  }, [user]);

  const currentTierName = membership?.tierName || "free";

  const freeTier = tiers.find((tier) => tier.price === 0);
  const paidTiers = tiers.filter((tier) => tier.price > 0);

  // Helper function to check if a tier is the user's current plan
  const isCurrentPlan = (tierName: string) => currentTierName === tierName;

  // Get the monthly tier for the value proposition section
  const monthlyTier = paidTiers.find((t) => t.billing_period === "monthly");
  const annualTier = paidTiers.find((t) => t.billing_period === "annual");

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
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Choose Your Membership
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Every player starts on our Free plan with access to the on-site
            queue. Upgrade any time to unlock paid membership perks.
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
                        ?.display_name ||
                        (currentTierName === "free"
                          ? "Free Member"
                          : "Unknown Plan")}
                    </p>
                    {membership.isPaid && membership.currentPeriodEnd && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {membership.cancelAtPeriodEnd
                          ? `Cancels on ${membership.currentPeriodEnd.toLocaleDateString()}`
                          : `Renews on ${membership.currentPeriodEnd.toLocaleDateString()}`}
                      </p>
                    )}
                    {!membership.isPaid && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Admin access — no billing required
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

        {freeTier && (
          <div className="max-w-4xl mx-auto mb-12">
            <h2 className="text-xl font-semibold text-foreground text-center mb-4">
              Included with every account
            </h2>
            <Card
              className={`border-2 ${
                isCurrentPlan(freeTier.name)
                  ? "border-primary bg-primary/5"
                  : "border-border"
              } relative max-w-xl mx-auto`}
            >
              {isCurrentPlan(freeTier.name) && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    <Crown className="w-3 h-3 mr-1" />
                    Current Plan
                  </Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">
                  {freeTier.display_name}
                </CardTitle>
                <CardDescription>
                  {freeTier.description ||
                    "Perfect for getting started at any event."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-3xl sm:text-4xl font-bold text-foreground">Free</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Join event queues in person with a single account.
                  </p>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">
                      Join queues via on-site QR code
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">
                      Track your position in real time
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">
                      Email updates for queue changes
                    </span>
                  </li>
                </ul>
                <div>
                  {user ? (
                    isCurrentPlan(freeTier.name) ? (
                      <Button className="w-full" variant="outline" disabled>
                        You're on this plan
                      </Button>
                    ) : (
                      <Button className="w-full" variant="outline" asChild>
                        <Link href="/settings/membership">
                          Switch to Free Plan
                        </Link>
                      </Button>
                    )
                  ) : (
                    <Button className="w-full" asChild>
                      <Link href="/signup">Create Free Account</Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pricing Cards */}
        {paidTiers.length === 0 ? (
          <div className="max-w-3xl mx-auto text-center">
            <Card className="border-border">
              <CardContent className="p-8">
                <h2 className="text-2xl font-semibold text-foreground mb-2">
                  Membership plans coming soon
                </h2>
                <p className="text-muted-foreground">
                  Paid membership options are being configured. Check back
                  shortly or contact support if you need access in the meantime.
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {paidTiers.map((tier) => {
              const isCurrent = isCurrentPlan(tier.name);

              return (
                <Card
                  key={tier.id}
                  className={`border-2 ${
                    isCurrent ? "border-primary bg-primary/5" : "border-border"
                  } relative`}
                >
                  {isCurrent && (
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
                      {tier.billing_period === "monthly" && !isCurrent && (
                        <Badge variant="default">Most Popular</Badge>
                      )}
                    </div>
                    <CardDescription>{tier.description || ""}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <p className="text-3xl sm:text-4xl font-bold text-foreground">
                        {formatPrice(tier.price)}
                        <span className="text-lg font-normal text-muted-foreground">
                          /{tier.billing_period}
                        </span>
                      </p>
                      {tier.billing_period === "monthly" && (
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

                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">
                          Email notifications
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-muted-foreground">
                          Support the Ghost Mammoths pickleball community
                        </span>
                      </li>
                    </ul>

                    {/* CTA Button */}
                    {user ? (
                      isCurrent ? (
                        <Button
                          variant="outline"
                          className="w-full"
                          size="lg"
                          asChild
                        >
                          <Link href="/settings/membership">
                            Manage Membership
                          </Link>
                        </Button>
                      ) : (
                        <Button className="w-full" size="lg" asChild>
                          <Link href={`/membership/checkout?tier=${tier.id}`}>
                            Switch to {tier.display_name}
                          </Link>
                        </Button>
                      )
                    ) : (
                      <Button className="w-full" size="lg" asChild>
                        <Link href={`/signup?tier=${tier.id}`}>Sign Up</Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Value Proposition */}
        {(monthlyTier || annualTier) && (
          <div className="max-w-4xl mx-auto mt-16 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Pick the plan that fits your play style
            </h2>
            <p className="text-muted-foreground mb-8">
              Stay flexible with monthly billing or lock in the best value for
              the year—paid plans add perks on top of the free queue experience.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {monthlyTier && (
                <Card className="border-border">
                  <CardContent className="p-6 text-center space-y-3">
                    <h3 className="text-xl font-semibold text-foreground">
                      Monthly Membership
                    </h3>
                    <p className="text-2xl sm:text-3xl font-bold text-foreground">
                      {formatPrice(monthlyTier.price)}
                      <span className="text-base font-normal text-muted-foreground">
                        /month
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Perfect if you want to try things out or keep it flexible.
                    </p>
                  </CardContent>
                </Card>
              )}
              {annualTier && (
                <Card className="border-border">
                  <CardContent className="p-6 text-center space-y-3">
                    <h3 className="text-xl font-semibold text-foreground">
                      Annual Membership
                    </h3>
                    <p className="text-2xl sm:text-3xl font-bold text-foreground">
                      {formatPrice(annualTier.price)}
                      <span className="text-base font-normal text-muted-foreground">
                        /year
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Two months free compared to paying monthly—our best value.
                    </p>
                  </CardContent>
                </Card>
              )}
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
                  Yes! You can cancel your membership at any time. You&apos;ll
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
                  Your membership stays active until your paid period ends.
                  After that, access to member-only features pauses until you
                  restart your plan.
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
                  Manage your subscription from Settings → Membership to update
                  billing details, review invoices, or cancel when needed.{" "}
                  <Link
                    href="/settings/membership"
                    className="text-primary underline"
                  >
                    Open membership settings
                  </Link>
                  .
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
