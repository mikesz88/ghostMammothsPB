# Phase 2 walkthrough — `app/events/[id]/page.tsx`

**Status: complete (April 2026).** The route is server-first; the sections below are a **historical map** of the old monolithic client page (line numbers refer to that pre-refactor file).

**Delivered layout**

* `app/events/[id]/page.tsx` — async Server Component: `loadEventDetailPageData`, `notFound()`, passes serialized props to the client island.
* `components/events/*` — `event-detail-client.tsx` (Realtime, queue, dialogs), `event-detail-hero.tsx`, `event-detail-stats-row.tsx`, `event-queue-header-row.tsx`, `event-detail-qr-dialog.tsx`.
* `lib/events/*` — `event-detail-server.ts`, `hydrate-event-detail.ts`, `map-event-row.ts`, `map-court-assignments.ts`, and small helpers. **Phase 4** added shared fetch/serialize/hydrate modules and DTOs — see [`phase-4-shared-event-admin-extraction.md`](phase-4-shared-event-admin-extraction.md).
* `lib/hooks/*` — court assignments Realtime, access sync, queue handlers, queue derived state, etc.
* `lib/membership/*` + `lib/membership-helpers.ts` — `getUserMembership` split into `lib/membership/` for lint/size; barrel re-exports unchanged for imports.

Target (achieved): **server-first `page.tsx`**, **no Supabase reads in the page file**, **Realtime + interactivity in `components/events/*` client leaves**. Behavior-neutral unless a bugfix is explicitly in scope.

**Historical baseline:** ~877 lines, file-level **`"use client"`**. The entire route was one client component.

---

## 1. Imports (lines 1–49) — what depends on `"use client"`

| Import | Role | Stays client? |
| --- | --- | --- |
| `lucide-react`, `next/image`, `sonner` | UI / toast | Client leaves |
| `use`, `useState`, `useEffect` | React client | Client leaves only |
| `@/app/actions/queue` | Server actions | Callable from client; OK |
| `CourtStatus`, `JoinQueueDialog`, `QueueList`, etc. | Presentational / interactive | Mostly client; some could become server wrappers later |
| `useAuth` | Client context | Client |
| `useRealtimeQueue` | Supabase Realtime + state | **Client only** |
| `canUserJoinEvent`, `formatPrice` | Pure / async helpers | Server or client; prefer **server** for initial `canJoin` if data allows |
| `QueueManager.estimateWaitTime` | Pure static method | OK on server for SSR snippet; today used in JSX (line ~693) |
| `createClient` (Supabase **browser**) | `useEffect` fetches | **Remove from page** — replace with server fetch or move effect into a leaf |
| `useNotifications` | Browser notifications | Client |

---

## 2. Component shell (lines 51–76)

* **`use(props.params)`** resolves `id` (Next 15+ `params` as Promise pattern on client).
* **Server page equivalent:** `export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; ... }`

Hooks initialized here:

* `useRealtimeQueue(id)` — **must remain under a client subtree** subscribed to `queue_entries` (or whatever the hook uses).
* `useAuth()`, `useNotifications()` — client.

---

## 3. Effects — classify each

### A. Event row fetch (lines 78–112)

* **Supabase client** `.from("events").select("*").eq("id", id).single()`
* **Move to:** Server Component: `createClient()` from `@/lib/supabase/server`, same query, map to your `Event` shape (date/courtCount/teamSize already done in effect).
* **Pass:** `event` as props into client island (serialize dates as ISO strings if needed, or pass primitives only).

### B. Court assignments + Realtime (lines 114–266)

* **Initial fetch:** `court_assignments` + nested `users` — **server** (same selects).
* **Realtime:** `supabase.channel(...).on("postgres_changes", ...)` — **client only** (browser subscription).
* **Pattern:** Server passes **initial `assignments`**; a client leaf `EventCourtAssignmentsLive` (or extend `CourtStatus` parent) owns `useEffect` subscription and merge/refetch strategy (today it calls `fetchAssignments()` on change).

### C. Membership gate (lines 268–281)

* `canUserJoinEvent(user.id, id)` — can run **on server** if it doesn’t need browser-only APIs (inspect `lib/membership-helpers.ts`). If it uses Supabase with user session, server page with `createClient()` + `getUser()` can compute **`canJoin`, `joinReason`, `requiresPayment`, `paymentAmount`** and pass as props.

### D. Admin flag (lines 283–297)

* `users.is_admin` via Supabase client — **server**: same query with server Supabase + session user.

### E. Queue link for QR (lines 299–306)

* Uses `window` — **client** only (tiny leaf or keep in dialog island).

### F. Position notifications (lines 394–413)

* `sendNotification` + `userPosition` — **client** (depends on queue + notifications hook).

---

## 4. Derived state & handlers (lines 308–558)

* **`currentUserEntry`, `userPosition`, `isPendingSolo`, etc.** — derive in **client** from `queue` + `user` (or pass `userId` from server).
* **`isCurrentlyPlaying`** — needs `assignments` + `user`; fine in client with props.
* **`handleEndGame`** — calls `endGameAndReorderQueue` server action; **keep in client** (or colocate in `CourtStatus` / `events/event-court-actions.tsx`).
* **`handleJoinQueue` / `handleQueueRemove`** — server actions + toast; **client** handlers in queue section leaf.

---

## 5. Render tree (lines 560–875)

| Region | Content | Phase 2 direction |
| --- | --- | --- |
| Loading / error (560–589) | Spinners, not-found | Server: `notFound()` or loading UI via `loading.tsx` / suspense |
| Layout (592–707) | Header, event meta, stats cards, `NotificationPrompt`, `QueuePositionAlert` | Server composes static shell; pass **`event`**, counts optional from server; badges that need `user`/`queue` → client island |
| Main grid (709–815) | `CourtStatus`, `QueueList` | Client islands with props (`event` subset, `assignments`, `queue`, callbacks) |
| Dialogs (817–873) | `JoinQueueDialog`, QR `Dialog` | Client leaves under `components/events/` |

**Nested ternary** in team size / rotation display (lines 618–628, 747–751) — consider small helpers to satisfy `no-nested-ternary` when you promote lint to error later.

---

## 6. Suggested extraction map (`components/events/`)

| New module (example) | Responsibility |
| --- | --- |
| `event-detail-client.tsx` | Top-level `"use client"` shell: `useRealtimeQueue`, auth, notifications, all effects that must stay client, receives `initialEvent`, `initialAssignments`, `access`, `isAdmin` from server page |
| `event-queue-section.tsx` | Queue list, join CTA, badges, `handleJoinQueue` / `handleQueueRemove` |
| `event-qr-dialog.tsx` | QR dialog only |
| `event-header-stats.tsx` (optional) | Server component for title/meta/stats if no client state needed |

Start with **one** client root to avoid prop drilling explosion; split further in a follow-up PR if needed.

---

## 7. Suggested migration PR order (minimize risk)

1. **Server loader(s)** — Add `lib/` or `app/events/[id]/` helpers: `getEventById`, `getCourtAssignmentsForEvent` using **server** Supabase (no behavior change in data shape).
2. **New server `page.tsx`** — Async page: fetch event + assignments + membership/admin flags; render `<EventDetailClient initialData={...} />`.
3. **Move client body** — Cut/paste current component into `components/events/event-detail-client.tsx`, delete duplicate fetches (replace with props), **keep** Realtime subscription effect in client.
4. **Verify** — Join queue, leave, admin remove, end game, QR, notifications, membership gate.
5. **Lint** — Fix `unused-imports` on touched files; run `npm run pr`.

Do **not** in this PR: change queue ordering algorithm, split `app/actions/queue.ts` broadly, or refactor `lib/queue-manager` internals.

---

## 8. Things that can break

* **Stale Realtime** if initial props and subscription get out of sync — keep one refetch path on postgres_changes.
* **Session-dependent RLS** — server fetch must use cookie-bound `createClient()` so RLS matches browser.
* **Serialization** — pass only JSON-safe props to client (Date → string if needed).
* **`Header`** — if it needs client context, keep as child of client boundary or pass session from server.

---

## 9. Quick line index

| Lines | Topic |
| ---: | --- |
| 1 | `"use client"` |
| 51–76 | State + hooks |
| 78–112 | Event fetch (move to server) |
| 114–266 | Assignments + Realtime (split server initial / client sub) |
| 268–297 | Membership + admin checks (move to server) |
| 299–306 | QR link (client) |
| 308–413 | Derived + notifications effect |
| 341–392 | `handleEndGame` |
| 424–558 | Join / remove handlers |
| 560–589 | Loading / error |
| 591–875 | Main JSX |

---

*See also:* [`phase-1-rsc-conventions.md`](phase-1-rsc-conventions.md), phased plan Phase 2 §, [`refactor-inventory.md`](refactor-inventory.md) (member event detail marked done; follow-up hotspots like `components/events/event-detail-client.tsx`, `lib/events/event-detail-server.ts`).
