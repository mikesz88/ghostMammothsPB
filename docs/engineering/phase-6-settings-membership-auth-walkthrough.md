# Phase 6 — settings, membership, and auth

**Status: complete (April 2026).** Routes in this phase follow the server-first pattern: thin `page.tsx` files, server loaders where initial data is needed, and interactive UI in domain client components under `components/settings/`, `components/membership/`, and `components/auth/`. Browser-only Supabase auth stays behind small client boundaries (`AuthProvider`, form clients, `lib/auth/*` helpers).

Phased plan: [`.cursor/plans/rules.mdc_phased_refactor_c02ab9c1.plan.md`](../../.cursor/plans/rules.mdc_phased_refactor_c02ab9c1.plan.md).

## Settings

| Route | Server entry | Client island |
| --- | --- | --- |
| [`app/settings/page.tsx`](../../app/settings/page.tsx) | [`loadSettingsHubPageData`](../../lib/settings/load-settings-hub-page-data.ts) | [`SettingsHubPageClient`](../../components/settings/settings-hub-page-client.tsx) |
| [`app/settings/membership/page.tsx`](../../app/settings/membership/page.tsx) | [`loadSettingsMembershipPageData`](../../lib/settings/load-settings-membership-page-data.ts) | [`SettingsMembershipPageClient`](../../components/settings/settings-membership-page-client.tsx) |
| [`app/settings/notifications/page.tsx`](../../app/settings/notifications/page.tsx) | [`loadSettingsNotificationsPageData`](../../lib/settings/load-settings-notifications-page-data.ts) | [`SettingsNotificationsPageClient`](../../components/settings/settings-notifications-page-client.tsx) |

## Membership

| Route | Server entry | Client island |
| --- | --- | --- |
| [`app/membership/page.tsx`](../../app/membership/page.tsx) | [`loadMembershipMarketingPageData`](../../lib/membership/load-membership-marketing-page-data.ts) | [`MembershipMarketingPageClient`](../../components/membership/membership-marketing-page-client.tsx) |
| [`app/membership/checkout/page.tsx`](../../app/membership/checkout/page.tsx) | [`loadMembershipCheckoutPageData`](../../lib/membership/load-membership-checkout-page-data.ts) (redirects if invalid tier) | [`MembershipCheckoutPageClient`](../../components/membership/membership-checkout-page-client.tsx) |
| [`app/membership/success/page.tsx`](../../app/membership/success/page.tsx) | [`loadMembershipSuccessPageData`](../../lib/membership/load-membership-success-page-data.ts) (redirects if missing/invalid session) | [`MembershipSuccessPageClient`](../../components/membership/membership-success-page-client.tsx) |
| [`app/membership/cancel/page.tsx`](../../app/membership/cancel/page.tsx) | — (static shell) | [`MembershipCancelPageShell`](../../components/membership/membership-cancel-page-shell.tsx) + [`MembershipCancelMainCard`](../../components/membership/membership-cancel-main-card.tsx) |

## Auth

| Route | Server entry | Client island |
| --- | --- | --- |
| [`app/login/page.tsx`](../../app/login/page.tsx) | `searchParams` for optional flash `message` | [`AuthPageShell`](../../components/auth/auth-page-shell.tsx) + [`LoginPageClient`](../../components/auth/login-page-client.tsx) |
| [`app/signup/page.tsx`](../../app/signup/page.tsx) | `searchParams` for `tier` / `flow` | [`SignupPageClient`](../../components/auth/signup-page-client.tsx) (and related signup components) |
| [`app/forgot-password/page.tsx`](../../app/forgot-password/page.tsx) | — | [`AuthPageShell`](../../components/auth/auth-page-shell.tsx) + [`ForgotPasswordPageClient`](../../components/auth/forgot-password-page-client.tsx) |
| [`app/reset-password/page.tsx`](../../app/reset-password/page.tsx) | — | [`ResetPasswordPageClient`](../../components/auth/reset-password-page-client.tsx) |

Shared auth UI and behavior: [`lib/auth-context.tsx`](../../lib/auth-context.tsx) (provider + `useAuth`), typed surface in [`lib/auth/auth-context-types.ts`](../../lib/auth/auth-context-types.ts), session sync and action factories under [`lib/auth/`](../../lib/auth/) (sign-in/up, password flows, post-login navigation via [`runAfterSignInNavigation`](../../lib/auth/run-after-sign-in-navigation.ts), validation helpers, submit helpers used by hooks).

## Exit criteria (checked)

* Target `page.tsx` files have no file-level `"use client"` except where the route is a tiny server wrapper only.
* Initial session/membership/profile reads for settings and membership flows run on the server via loaders; forms and Supabase auth calls live in client leaves or `lib/auth` helpers consumed by hooks.
* Auth provider logic is split into small modules so `eslint` rules on the auth surface stay clean.

## Next phase pointer

**Phase 7** — action layer split (`queue.ts`, `notifications.ts`, …) per plan.
