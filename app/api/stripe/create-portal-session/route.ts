import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createCustomerPortalSession } from "@/lib/stripe/server";

export async function POST() {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get user's Stripe customer ID
    const { data: membership } = await supabase
      .from("user_memberships")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    if (!membership?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No Stripe customer found" },
        { status: 404 }
      );
    }

    // Create portal session
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3001";
    const { session, error } = await createCustomerPortalSession(
      membership.stripe_customer_id,
      `${baseUrl}/settings/membership`
    );

    if (error || !session) {
      console.error("Error creating portal session:", error);
      return NextResponse.json(
        { error: "Failed to create portal session" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Error in create-portal-session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
