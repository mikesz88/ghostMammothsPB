/** Public site origin for Supabase email redirects (client or NEXT_PUBLIC_URL). */
export function getAppBaseUrlOrNull(): string | null {
  const fromEnv = process.env.NEXT_PUBLIC_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    return window.location.origin.replace(/\/$/, "");
  }
  return null;
}
