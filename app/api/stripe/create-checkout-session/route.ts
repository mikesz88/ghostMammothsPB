import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createMembershipCheckoutSession } from "@/lib/stripe/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { priceId, tierId } = await request.json();

    if (!priceId || !tierId) {
      console.error("Missing required fields:", { priceId, tierId });
      return NextResponse.json(
        { error: "Price ID and Tier ID are required" },
        { status: 400 }
      );
    }

    // Verify tier exists and is valid (server-side validation for security)
    const { data: tier, error: tierError } = await supabase
      .from("membership_tiers")
      .select("id, name, stripe_price_id, price, is_active")
      .eq("id", tierId)
      .eq("is_active", true)
      .single();

    if (tierError || !tier) {
      console.error("Invalid tier:", tierError);
      return NextResponse.json(
        { error: "Invalid membership tier" },
        { status: 400 }
      );
    }

    // Verify the price ID matches (security check)
    if (tier.stripe_price_id !== priceId) {
      console.error("Price ID mismatch:", {
        provided: priceId,
        expected: tier.stripe_price_id,
      });
      return NextResponse.json(
        { error: "Invalid price configuration" },
        { status: 400 }
      );
    }

    // Verify tier requires payment
    if (tier.price <= 0) {
      console.error("Attempted checkout for free tier:", tier);
      return NextResponse.json(
        { error: "This tier does not require payment" },
        { status: 400 }
      );
    }

    // Create Stripe checkout session
    // Prioritize NEXT_PUBLIC_URL environment variable for production
    const host = request.headers.get("host");
    const protocol =
      request.headers.get("x-forwarded-proto") ||
      (process.env.NODE_ENV === "development" ? "http" : "https");
    const baseUrl =
      process.env.NEXT_PUBLIC_URL || (host ? `${protocol}://${host}` : null);

    if (!baseUrl) {
      console.error(
        "Unable to determine base URL - NEXT_PUBLIC_URL environment variable or host header required"
      );
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    console.log("Creating checkout session for:", {
      userId: user.id,
      email: user.email,
      priceId,
      tierId: tier.id,
      tierName: tier.name,
    });

    const { session, error } = await createMembershipCheckoutSession(
      user.id,
      user.email!,
      priceId,
      tier.id,
      tier.name,
      `${baseUrl}/membership/success`,
      `${baseUrl}/membership/cancel`
    );

    if (error || !session) {
      console.error("Stripe error:", error);
      return NextResponse.json(
        {
          error:
            "Failed to create checkout session. Please check your Stripe configuration.",
        },
        { status: 500 }
      );
    }

    console.log("Checkout session created successfully:", session.id);
    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error in create-checkout-session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
