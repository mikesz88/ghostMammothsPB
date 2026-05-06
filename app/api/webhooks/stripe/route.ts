import { NextRequest, NextResponse } from "next/server";


import { stripe } from "@/lib/stripe/server";
import { dispatchStripeWebhookEvent } from "@/lib/stripe/webhooks/dispatch";
import { createServiceRoleClient } from "@/lib/supabase/service-role";

import type Stripe from "stripe";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Webhook signature verification failed" },
      { status: 400 },
    );
  }

  const supabase = createServiceRoleClient();
  if (!supabase) {
    console.error("Stripe webhook: missing service role client");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 503 },
    );
  }

  try {
    await dispatchStripeWebhookEvent(event, supabase);
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
