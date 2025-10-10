"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CreditCard, Shield, Check } from "lucide-react";
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

export default function CheckoutPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const monthlyPrice = 35;

  const handleCheckout = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID,
        }),
      });

      const { url, error } = await response.json();

      if (error) {
        alert(`Failed to create checkout session: ${error}`);
        setLoading(false);
        return;
      }

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      alert("An unexpected error occurred. Please try again.");
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Upgrade to Monthly Membership
            </h1>
            <p className="text-muted-foreground">
              Get unlimited access to all events
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
                    Monthly Membership
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Billed monthly • Cancel anytime
                  </p>
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {formatPrice(monthlyPrice)}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">
                    Free entry to all events
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">
                    Priority queue position
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">
                    Exclusive events access
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  <span className="text-muted-foreground">
                    10% merchandise discount
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
            disabled={loading}
            size="lg"
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
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
