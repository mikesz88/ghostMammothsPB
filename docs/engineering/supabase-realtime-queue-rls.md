# Supabase Realtime and `queue_entries` (why others don’t see leaves)

[`postgres_changes`](https://supabase.com/docs/guides/realtime/postgres-changes) on `queue_entries` only delivers events to a subscriber if that subscriber’s JWT **passes Row Level Security for that row** (including the row **before** a `DELETE`).

If your **SELECT** policy on `queue_entries` is effectively *“users may only read their own row”*, then:

- User A’s browser **will** receive events about A’s row.
- User B’s browser **will not** receive `DELETE` (or `UPDATE`) events for A’s row, so the member and admin UIs that refetch on `postgres_changes` **will not update** until something else triggers a refetch (navigation, focus, or polling).

## Fix (database)

Add (or widen) a **`SELECT`** policy so everyone who should **see the live queue** may read `queue_entries` for that `event_id`. Example pattern (adjust to your registration / membership rules):

```sql
-- Example only — align with your event_registrations / roles model.
CREATE POLICY "event_participants_read_queue"
ON public.queue_entries
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.event_registrations er
    WHERE er.event_id = queue_entries.event_id
      AND er.user_id = auth.uid()
  )
);
```

**Also ensure** in Supabase:

1. **`queue_entries` is in the `supabase_realtime` publication** for the events you care about.
2. Replica identity / table is enabled for Realtime per your project defaults.

## App behavior

The client subscribes with a filter `event_id=eq.<uuid>` and refetches on any change. Fixing **SELECT** for peers on the same event is what makes **DELETE** (leave queue) visible to everyone in real time.

Optional: use env **`NEXT_PUBLIC_QUEUE_POLL_INTERVAL_MS`** (see `lib/realtime/queue-poll-interval.ts`) for a short polling fallback when RLS can’t be changed immediately.
