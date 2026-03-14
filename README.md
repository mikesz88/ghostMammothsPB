![SaaS](https://img.shields.io/badge/Platform-Membership%20%26%20Events-blue)
![Next.js](https://img.shields.io/badge/Next.js-App%20Router-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20PostgreSQL-green)
![Stripe](https://img.shields.io/badge/Billing-Stripe-purple)

# Ghost Mammoth Pickleball – Membership & Event Management SaaS

A **full-stack membership and event management platform** for pickleball clubs, built with **Next.js, TypeScript, and Supabase**.

The system supports **member management, event sessions, play queues, court assignments, subscription billing, and event coordination** — giving community organizations a centralized alternative to spreadsheets and manual coordination.

---

## Live Application

Production site: [https://www.ghostmammothpbc.com/](https://www.ghostmammothpbc.com/)

Ghost Mammoth Pickleball is a SaaS platform where clubs can manage members, run event sessions with queues and court rotation, and handle payments in one place.

---

## Why This Project Exists

Pickleball clubs often rely on spreadsheets and manual coordination to manage sessions and events.

Ghost Mammoth Pickleball was built to provide a centralized platform for:

- Managing memberships and tiers (free vs paid)
- Running event sessions with configurable queues and court assignments
- Handling subscriptions and payments via Stripe
- Coordinating events for a growing community

The project demonstrates how a modern SaaS platform can support **real community organizations** using scalable web technologies. It is suitable both as a production-ready product and as a portfolio piece showcasing full-stack, auth, billing, and accessibility practices.

---

## What This Project Demonstrates

This project explores several real-world engineering patterns:

- **Membership and organization management** — Tiers, Stripe subscriptions, and membership-gated event access
- **Event sessions and play queues** — Queue entries, court assignments, rotation types (e.g. 2-stay-4-off, winners-stay)
- **Subscription billing and payment flows** — Checkout, customer portal, webhooks, cancel/reactivate
- **Role-based access** — Admin vs member; RLS and server-side checks
- **Realtime updates** — Supabase Realtime for queue and court status
- **Accessibility (a11y)** — ESLint jsx-a11y, Playwright + axe-core for WCAG 2.x Level A & AA

---

## Architecture Goals

The system was designed around several principles:

- Clear separation between club data and member access via Supabase Row Level Security (RLS)
- Server-first architecture for Stripe, webhooks, and sensitive operations
- Relational schema for users, events, queue entries, court assignments, memberships, and payments
- Realtime queue and court state for live session management
- Flexible billing (Stripe) for subscriptions and event-based access

---

## Engineering Challenges

Some of the technical challenges addressed in this project include:

- Modeling events, queue entries, and court assignments in a relational schema with rotation types and team sizes
- Implementing role-based access (admins, members) with Supabase Auth and RLS
- Syncing Stripe subscription state with membership status via webhooks
- Realtime queue and court updates with Supabase Realtime
- Concurrent queue management and capacity limits
- Accessibility compliance (WCAG 2.0/2.1/2.2 A & AA) enforced in CI via lint and E2E a11y tests

---

## Key Capabilities

- **Member management** — Roster, roles (admin/member), skill level, and contact info
- **Events** — Create and manage event sessions with location, date, court count, team size, and rotation type
- **Play queue & courts** — Join/leave queue, assign players to courts, track status (waiting/playing/completed)
- **Membership & payments** — Tiers (e.g. free, monthly), Stripe checkout, customer portal, cancel/reactivate
- **Admin tools** — Dashboard for events, users, and email stats; event test controls
- **Settings** — Membership and notification preferences
- **Accessibility** — Strict jsx-a11y linting and automated WCAG-focused E2E a11y tests

---

## Tech Stack

| Layer           | Technologies |
|----------------|--------------|
| **Frontend**   | Next.js 16 (App Router) • React 19 • TypeScript • Tailwind CSS • Radix UI (shadcn/ui) |
| **Backend**    | Next.js API Routes • Supabase (PostgreSQL, Auth, Realtime) |
| **Billing**    | Stripe (Checkout, Customer Portal, Webhooks) |
| **Email**      | Resend |
| **Infrastructure** | Vercel (hosting) • Vercel Analytics |
| **Quality**    | ESLint (jsx-a11y) • Playwright • axe-core (E2E a11y) |

---

## Getting Started

### Prerequisites

- Node.js 18+ (or Bun)
- Supabase project (or local Supabase via CLI)
- Stripe account (test mode is sufficient for development)
- Resend account (optional, for email)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd ghostMammothsPB
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment variables**  
   Create `.env.local` and set:
   - `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (server-only; e.g. API routes, profile creation)
   - `STRIPE_SECRET_KEY` — Stripe secret key
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — Stripe publishable key
   - `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret (for `/api/webhooks/stripe`)
   - `RESEND_API_KEY` — (Optional) Resend API key for transactional email
   - `NEXT_PUBLIC_URL` — (Optional) Base URL for Stripe redirects (e.g. `http://localhost:3000` in dev)

4. **Database**  
   Apply the SQL migrations in `supabase/scripts/` to your Supabase project (in order: `01-create-tables.sql` through the latest). If using Supabase CLI locally, run migrations against your local project.

5. **Seed data (optional)**  
   If seed scripts are present:
   ```bash
   npm run seed:users
   npm run seed:event
   ```

6. **Start the dev server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

### CI and quality

- **Lint:** `npm run lint`
- **Build:** `npm run build` (includes lint)
- **E2E a11y:** `npm run test:a11y`
- **Full CI:** `npm run ci` (lint, build, a11y tests)

---

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── admin/              # Admin dashboard (events, users, email stats)
│   ├── api/                # API routes (Stripe, webhooks, account, users)
│   ├── auth/                # Auth callback (Supabase)
│   ├── events/              # Events list and event detail (queue, courts)
│   ├── membership/         # Membership tiers, checkout, success, cancel
│   ├── settings/           # User settings (membership, notifications)
│   ├── login/ signup/      # Auth pages
│   └── ...
├── components/             # React components (UI, queue, court, dialogs)
├── lib/                    # Utilities, Supabase/Stripe clients, auth context, hooks
├── supabase/
│   ├── scripts/            # SQL migrations and schema (tables, RLS, functions)
│   ├── config.toml         # Supabase local config
│   └── supa-schema.ts      # Generated types
├── e2e/                    # Playwright E2E (e.g. a11y.spec.ts)
├── scripts/                # Seed and helper scripts (e.g. seed:users, seed:event)
└── ...
```

---

## License

MIT
