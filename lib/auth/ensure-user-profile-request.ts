"use client";

type ProfilePayload = {
  name?: string;
  skill_level?: string;
  phone?: string;
};

export async function postEnsureUserProfile(body: ProfilePayload) {
  const res = await fetch("/api/users/ensure-profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    console.warn("Could not ensure user profile:", await res.text());
  }
}
