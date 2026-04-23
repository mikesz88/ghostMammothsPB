import { NextRequest, NextResponse } from "next/server";

import {
  respondToStripeVerifySessionGet,
  sessionIdFromVerifySessionRequest,
} from "@/lib/membership/stripe-verify-session-get";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const sessionId = sessionIdFromVerifySessionRequest(request);
    return respondToStripeVerifySessionGet(supabase, user.id, sessionId);
  } catch (error) {
    console.error("Error in verify-session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
