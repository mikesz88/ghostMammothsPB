![SaaS](https://img.shields.io/badge/Platform-Membership%20%26%20Events-blue)
![Next.js](https://img.shields.io/badge/Next.js-App%20Router-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Supabase](https://img.shields.io/badge/Supabase-Auth%20%26%20PostgreSQL-green)
![Stripe](https://img.shields.io/badge/Billing-Stripe-purple)

# Ghost Mammoth Pickleball – Membership & Event Management SaaS

A **full-stack membership and event management platform** for **Ghost Mammoth Pickleball**, a single-club product built with **Next.js, TypeScript, and Supabase**.

The system supports **member management, event sessions, play queues, court assignments, subscription billing, and event coordination** — giving the club a centralized alternative to spreadsheets and manual coordination.

---

## Live Application

Production site: [https://www.ghostmammothpbc.com/](https://www.ghostmammothpbc.com/)

Ghost Mammoth Pickleball is the club’s platform to manage members, run event sessions with queues and court rotation, and handle payments in one place.

---

## Why This Project Exists

Clubs often rely on spreadsheets and manual coordination to manage sessions and events.

This platform was built for Ghost Mammoth Pickleball to provide a centralized system for:

- Managing memberships and tiers (free vs paid)
- Running event sessions with configurable queues and court assignments
- Handling subscriptions and payments via Stripe
- Coordinating events for a growing community

The project demonstrates how a modern SaaS platform can support **a real club** using scalable web technologies. It is suitable both as a production-ready product and as a portfolio piece showcasing full-stack, auth, billing, and accessibility practices.

---

## What This Project Demonstrates

This project explores several real-world engineering patterns:

- **Membership and organization management** — Tiers, Stripe subscriptions, and membership-gated event access
- **Event sessions and play queues** — Queue entries, court assignments, rotation types (rotate all, winners stay, 2 Stay 2 Off)
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
- **Admin tools** — Dashboard for club organizers (events, users, email stats; event test controls)
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
