export async function postMembershipCheckoutCreateSessionRequest(
  priceId: string,
  tierId: string,
) {
  const response = await fetch("/api/stripe/create-checkout-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ priceId, tierId }),
  });
  return response.json() as Promise<{ url?: string; error?: string }>;
}
