"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Crown, Zap, Shield, Gift, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/ui/header";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/membership-helpers";

interface MembershipTier {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  price: number;
  billing_period: string;
  features: {
    event_access?: string;
    priority_queue?: boolean;
    exclusive_events?: boolean;
    merchandise_discount?: number;
  };
}

export default function MembershipSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tier, setTier] = useState<MembershipTier | null>(null);

  useEffect(() => {
    const fetchSubscriptionInfo = async () => {
      const sessionId = searchParams.get("session_id");

      if (!sessionId) {
        toast.error("Invalid checkout session");
        router.push("/membership");
        return;
      }

      try {
        // Verify session and get tier info from our API
        const response = await fetch(
          `/api/stripe/verify-session?session_id=${sessionId}`
        );
        const data = await response.json();

        if (data.error) {
          toast.error("Failed to verify checkout session");
          router.push("/membership");
          return;
        }

        // Fetch tier from database
        const supabase = createClient();
        const { data: tierData, error } = await supabase
          .from("membership_tiers")
          .select("*")
          .eq("id", data.tier_id)
          .single();

        if (error || !tierData) {
          toast.error("Failed to load membership details");
          router.push("/membership");
          return;
        }

        setTier(tierData as MembershipTier);
      } catch (error) {
        console.error("Error fetching subscription info:", error);
        toast.error("An error occurred");
        router.push("/membership");
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionInfo();
  }, [searchParams, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            <span className="text-muted-foreground">
              Confirming your subscription...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!tier) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <Card className="max-w-md mx-auto">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Something went wrong
              </h2>
              <p className="text-muted-foreground mb-6">
                We couldn't load your membership details.
              </p>
              <Button asChild>
                <Link href="/membership">Back to Membership</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-20">
        <Card className="max-w-2xl mx-auto border-primary">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-primary" />
            </div>

            <h1 className="text-3xl font-bold text-foreground mb-4">
              Welcome to {tier.display_name}!
            </h1>

            <p className="text-lg text-muted-foreground mb-8">
              Your subscription is now active at {formatPrice(tier.price)}/
              {tier.billing_period}!
            </p>

            <div className="bg-primary/5 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Crown className="w-5 h-5 text-primary" />
                <p className="font-semibold text-foreground">
                  Your {tier.display_name} Benefits
                </p>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {tier.features?.event_access === "unlimited" && (
                  <li className="flex items-center justify-center gap-2">
                    <Zap className="w-4 h-4 text-primary" />
                    Free entry to ALL events
                  </li>
                )}
                {tier.features?.priority_queue && (
                  <li className="flex items-center justify-center gap-2">
                    <Shield className="w-4 h-4 text-primary" />
                    Priority queue position
                  </li>
                )}
                {tier.features?.exclusive_events && (
                  <li className="flex items-center justify-center gap-2">
                    <Crown className="w-4 h-4 text-primary" />
                    Exclusive events access
                  </li>
                )}
                {tier.features?.merchandise_discount && (
                  <li className="flex items-center justify-center gap-2">
                    <Gift className="w-4 h-4 text-primary" />
                    {tier.features.merchandise_discount}% merchandise discount
                  </li>
                )}
                <li className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  SMS & email notifications
                </li>
                <li className="flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-primary" />
                  Support local pickleball community
                </li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/events">Browse Events</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/settings/membership">Manage Membership</Link>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mt-6">
              You'll receive a confirmation email with your receipt shortly.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
