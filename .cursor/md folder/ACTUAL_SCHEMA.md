# Actual Supabase Database Schema

This documents the ACTUAL schema in your Supabase database (not the ideal schema).

## Events Table

```sql
create table public.events (
  id uuid not null default gen_random_uuid(),
  created_at timestamp with time zone not null default now(),
  name text not null,
  location text not null,
  date date not null,                          -- DATE type (YYYY-MM-DD)
  time time without time zone not null,        -- TIME type (HH:MM:SS)
  num_courts text not null,                    -- TEXT type (legacy/duplicate)
  rotation_type text not null,
  court_count smallint not null,               -- SMALLINT type (actual count)
  status text not null,
  constraint events_pkey primary key (id)
);
```

### Notes:
- `date` and `time` are separate columns (not combined TIMESTAMP)
- Both `num_courts` (TEXT) and `court_count` (SMALLINT) exist
- We send both to satisfy constraints

## Users Table

```sql
create table public.users (
  id uuid not null primary key,
  email text unique not null,
  name text not null,
  phone text,
  skill_level text not null,
  is_admin boolean default false,
  stripe_customer_id text,
  membership_status text default 'free',
  created_at timestamp default now()
);
```

## Queue Entries Table

```sql
create table public.queue_entries (
  id uuid not null primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  group_id uuid,
  group_size integer default 1,
  position integer not null,
  status text not null default 'waiting',
  joined_at timestamp default now(),
  unique(event_id, user_id)
);
```

## Court Assignments Table

```sql
create table public.court_assignments (
  id uuid not null primary key default gen_random_uuid(),
  event_id uuid references events(id) on delete cascade,
  court_number integer not null,
  player1_id uuid references users(id),
  player2_id uuid references users(id),
  player3_id uuid references users(id),
  player4_id uuid references users(id),
  started_at timestamp default now(),
  ended_at timestamp,
  unique(event_id, court_number)
);
```

---

## Code Mapping

### When Creating/Updating Events:

```typescript
const eventDateTime = new Date(eventData.date);
const dateOnly = eventDateTime.toISOString().split("T")[0]; // "2025-10-15"
const timeOnly = eventDateTime.toTimeString().split(" ")[0]; // "14:30:00"

await supabase.from("events").insert({
  name: eventData.name,
  location: eventData.location,
  date: dateOnly,                              // DATE column
  time: timeOnly,                              // TIME column
  num_courts: eventData.courtCount.toString(), // TEXT column
  court_count: eventData.courtCount,           // SMALLINT column
  rotation_type: eventData.rotationType,
  status: eventData.status,
});
```

### When Reading Events:

```typescript
const { data } = await supabase.from("events").select("*");

// data will have:
// - date: "2025-10-15" (string)
// - time: "14:30:00" (string)
// - num_courts: "4" (string)
// - court_count: 4 (number)
```

---

## Schema Inconsistencies

Your database has some redundancy:
1. **`num_courts` (TEXT) vs `court_count` (SMALLINT)** - Both store the same data
2. **Separate `date` and `time`** - Could be combined into single TIMESTAMP

### Recommendation:
For now, we send both `num_courts` and `court_count` to satisfy all constraints. In the future, you could clean this up by:
- Removing `num_courts` column
- Combining `date` and `time` into single TIMESTAMP column

But for MVP, the current fix works perfectly!

---

## Updated Files

1. ✅ `app/admin/page.tsx` - Now sends `num_courts` and proper date/time format
2. ✅ `lib/types.ts` - Updated Event interface to match schema
3. ✅ `ACTUAL_SCHEMA.md` - This file (documentation)

---

## Test Now!

Event creation should work now. Try:
1. Go to `/admin`
2. Click "Create Event"
3. Fill in the form
4. Submit
5. Should see success message
6. Event should appear in list

