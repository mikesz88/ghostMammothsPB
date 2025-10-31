"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Loader2,
  CreditCard,
  Shield,
  Check,
  Crown,
  Zap,
  Gift,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Header } from "@/components/ui/header";
import { useAuth } from "@/lib/auth-context";
import { formatPrice } from "@/lib/membership-helpers";
import { createClient } from "@/lib/supabase/client";

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
}

function CheckoutContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState<MembershipTier | null>(null);

  // Fetch selected tier from database
  useEffect(() => {
    const fetchTier = async () => {
      const tierId = searchParams.get("tier");

      if (!tierId) {
        toast.error("No membership plan selected");
        router.push("/membership");
        return;
      }

      const supabase = createClient();
      const { data, error } = await supabase
        .from("membership_tiers")
        .select("*")
        .eq("id", tierId)
        .eq("is_active", true)
        .single();

      if (error || !data) {
        toast.error("Invalid membership plan");
        router.push("/membership");
        return;
      }

      // Validate that this is a paid tier
      if (data.price <= 0) {
        toast.error("This plan does not require checkout");
        router.push("/membership");
        return;
      }

      // Validate Stripe price ID exists
      if (!data.stripe_price_id) {
        console.error("Missing Stripe price ID for tier:", data.name);
        toast.error("This plan is not configured for purchase", {
          description:
            "The Stripe price ID is missing. Please contact support.",
        });
        router.push("/membership");
        return;
      }

      console.log("Checkout tier loaded:", {
        name: data.name,
        price: data.price,
        stripePriceId: data.stripe_price_id,
      });

      setSelectedTier(data as MembershipTier);
      setLoading(false);
    };

    fetchTier();
  }, [searchParams, router]);

  const handleCheckout = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    if (!selectedTier || !selectedTier.stripe_price_id) {
      toast.error("Invalid membership plan");
      return;
    }

    setCheckoutLoading(true);

    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: selectedTier.stripe_price_id,
          tierId: selectedTier.id,
        }),
      });

      const { url, error } = await response.json();

      if (error) {
        toast.error("Failed to create checkout session", {
          description: error,
        });
        setCheckoutLoading(false);
        return;
      }

      if (url) {
        // Redirect to Stripe checkout
        window.location.href = url;
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast.error("An unexpected error occurred", {
        description: "Please try again.",
      });
      setCheckoutLoading(false);
    }
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
                Please sign in to upgrade your membership
              </p>
              <Button asChild className="w-full">
                <a href="/login">Sign In</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (loading || !selectedTier) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            <span className="text-muted-foreground">Loading checkout...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Upgrade to {selectedTier.display_name}
            </h1>
            <p className="text-muted-foreground">
              {selectedTier.description || "Get unlimited access to all events"}
            </p>
          </div>

          {/* Order Summary */}
          <Card className="border-border mb-6">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b">
                <div>
                  <p className="font-medium text-foreground">
                    {selectedTier.display_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Billed {selectedTier.billing_period} • Cancel anytime
                  </p>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {formatPrice(selectedTier.price)}
                </p>
              </div>

              <div className="space-y-2">
                {selectedTier.features?.event_access === "unlimited" && (
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">
                      Free entry to all events
                    </span>
                  </div>
                )}
                {selectedTier.features?.priority_queue && (
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">
                      Priority queue position
                    </span>
                  </div>
                )}
                {selectedTier.features?.exclusive_events && (
                  <div className="flex items-center gap-2 text-sm">
                    <Crown className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">
                      Exclusive events access
                    </span>
                  </div>
                )}
                {selectedTier.features?.merchandise_discount && (
                  <div className="flex items-center gap-2 text-sm">
                    <Gift className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">
                      {selectedTier.features.merchandise_discount}% merchandise
                      discount
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">
                    SMS & email notifications
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">
                    Support local pickleball community
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card className="border-border mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground mb-1">
                    Secure Payment
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Your payment information is encrypted and secure. We use
                    Stripe for payment processing and never store your card
                    details.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Checkout Button */}
          <Button
            onClick={handleCheckout}
            disabled={checkoutLoading}
            size="lg"
            className="w-full"
          >
            {checkoutLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Redirecting to checkout...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Continue to Payment
              </>
            )}
          </Button>

          <p className="text-center text-sm text-muted-foreground mt-4">
            You'll be redirected to Stripe's secure checkout page
          </p>

          {/* Cancel Link */}
          <div className="text-center mt-6">
            <Button variant="ghost" asChild>
              <a href="/membership">← Back to Membership Plans</a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
