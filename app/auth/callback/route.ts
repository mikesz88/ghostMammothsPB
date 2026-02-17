import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createServiceRoleClient } from "@/lib/supabase/service-role";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/membership";

  const cookieStore = await cookies();
  const redirectUrl = `${origin}${next}`;
  const redirectResponse = NextResponse.redirect(redirectUrl);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
            redirectResponse.cookies.set(name, value, { ...options, path: "/" });
          });
        },
      },
    }
  );

  let user: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null = null;

  // Prefer token_hash flow (works when link opened in different browser - no PKCE required)
  if (token_hash && type) {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as EmailOtpType,
    });
    if (!error && data.user) {
      user = data.user;
    } else if (error) {
      console.error("Auth callback verifyOtp error:", error.message);
    }
  }
  // Fallback to code exchange (requires PKCE - same browser where user signed up)
  else if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      user = data.user;
    } else if (error) {
      console.error("Auth callback exchangeCodeForSession error:", error.message);
    }
  }

  if (user) {
    const supabaseAdmin = createServiceRoleClient();
    if (supabaseAdmin) {
      await supabaseAdmin.from("users").upsert(
        {
          id: user.id,
          email: user.email ?? "",
          name: (user.user_metadata?.name as string) ?? user.email?.split("@")[0] ?? "User",
          skill_level: (user.user_metadata?.skill_level as string) ?? "intermediate",
          phone: (user.user_metadata?.phone as string) ?? "",
          is_admin: false,
        },
        { onConflict: "id" }
      );
    }
    return redirectResponse;
  }

  // Failed - redirect with helpful message. User can try signing in (email may already be confirmed)
  return NextResponse.redirect(
    `${origin}/login?message=Confirmation link expired or invalid. Try signing in with your password — your email may already be confirmed.`
  );
}
