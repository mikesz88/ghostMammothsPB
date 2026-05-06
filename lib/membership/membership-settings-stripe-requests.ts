export async function postCancelSubscriptionRequest() {
  const response = await fetch("/api/stripe/cancel-subscription", {
    method: "POST",
  });
  return response.json() as Promise<{ error?: string }>;
}

export async function postReactivateSubscriptionRequest() {
  const response = await fetch("/api/stripe/reactivate-subscription", {
    method: "POST",
  });
  return response.json() as Promise<{ error?: string }>;
}

export async function postBillingPortalSessionRequest() {
  const response = await fetch("/api/stripe/create-portal-session", {
    method: "POST",
  });
  return response.json() as Promise<{
    url?: string;
    error?: string;
    details?: string;
  }>;
}
