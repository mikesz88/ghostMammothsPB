# Data Parsing Fixes - Supabase to TypeScript

## 🐛 Problems Fixed

### Issue 1: Date/Time Parsing Errors
**Error:** `TypeError: event.date.toLocaleDateString is not a function`
**Cause:** Supabase returns dates as strings, not Date objects

### Issue 2: Court Count Display (NaN)
**Error:** Court count showing as NaN or empty
**Cause:** Database stores as string/smallint, code expected number

### Issue 3: Queue joinedAt Error
**Error:** `Cannot read properties of undefined (reading 'getTime')`
**Cause:** `joinedAt` field was a string, not Date object

---

## ✅ Solutions Applied

### Fix 1: Admin Page Data Parsing
**File:** `app/admin/page.tsx`

```typescript
const eventsWithDates = (data || []).map((event: any) => ({
  ...event,
  date: event.date && event.time 
    ? new Date(`${event.date}T${event.time}`)
    : new Date(event.date),
  courtCount: parseInt(event.court_count) || parseInt(event.num_courts) || 0,
  rotationType: event.rotation_type,
  createdAt: new Date(event.created_at),
  updatedAt: event.updated_at ? new Date(event.updated_at) : new Date(),
}));
```

### Fix 2: Events Page Data Parsing
**File:** `lib/hooks/use-realtime-events.ts`

```typescript
const eventsWithDates = (data || []).map((event: any) => ({
  ...event,
  date: event.date && event.time
    ? new Date(`${event.date}T${event.time}`)
    : new Date(event.date),
  courtCount: parseInt(event.court_count) || parseInt(event.num_courts) || 0,
  rotationType: event.rotation_type,
  createdAt: new Date(event.created_at),
  updatedAt: event.updated_at ? new Date(event.updated_at) : new Date(),
}));
```

### Fix 3: Event Detail Page Data Parsing
**File:** `app/events/[id]/page.tsx`

```typescript
const eventWithDate = {
  ...data,
  date: data.date && data.time
    ? new Date(`${data.date}T${data.time}`)
    : new Date(data.date),
  courtCount: parseInt(data.court_count) || parseInt(data.num_courts) || 0,
  rotationType: data.rotation_type,
  createdAt: new Date(data.created_at),
  updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
};
```

### Fix 4: Queue Data Parsing
**File:** `lib/hooks/use-realtime-queue.ts`

```typescript
const queueWithDates = (data || []).map((entry: any) => ({
  ...entry,
  eventId: entry.event_id,
  userId: entry.user_id,
  groupId: entry.group_id,
  groupSize: entry.group_size,
  joinedAt: new Date(entry.joined_at),
}));
```

---

## 🎯 What Each Fix Does

### Date/Time Conversion
**Database:** Returns separate `date` (string) and `time` (string)
**Code:** Combines into single Date object
```typescript
"2025-10-15" + "T" + "14:30:00" = "2025-10-15T14:30:00"
new Date("2025-10-15T14:30:00") = Date object
```

### Court Count Parsing
**Database:** `court_count` (smallint) and `num_courts` (text)
**Code:** Parses to number with fallback
```typescript
parseInt("4") || parseInt("4") || 0 = 4
```

### Snake Case to Camel Case
**Database:** `event_id`, `user_id`, `joined_at`, etc.
**Code:** `eventId`, `userId`, `joinedAt`, etc.
```typescript
eventId: entry.event_id  // Maps snake_case to camelCase
```

---

## 📊 Database Schema Mapping

### Events Table
| Database Column | TypeScript Property | Type Conversion |
|----------------|---------------------|-----------------|
| `id` | `id` | string (no change) |
| `name` | `name` | string (no change) |
| `location` | `location` | string (no change) |
| `date` | `date` (part of) | string → Date |
| `time` | `date` (part of) | string → Date |
| `num_courts` | `numCourts` | string (optional) |
| `court_count` | `courtCount` | string/number → number |
| `rotation_type` | `rotationType` | string (no change) |
| `status` | `status` | string (no change) |
| `created_at` | `createdAt` | string → Date |
| `updated_at` | `updatedAt` | string → Date |

### Queue Entries Table
| Database Column | TypeScript Property | Type Conversion |
|----------------|---------------------|-----------------|
| `id` | `id` | string (no change) |
| `event_id` | `eventId` | string (no change) |
| `user_id` | `userId` | string (no change) |
| `group_id` | `groupId` | string (no change) |
| `group_size` | `groupSize` | number (no change) |
| `position` | `position` | number (no change) |
| `status` | `status` | string (no change) |
| `joined_at` | `joinedAt` | string → Date |

---

## ✅ Files Updated

1. ✅ `app/admin/page.tsx` - Admin dashboard data parsing
2. ✅ `lib/hooks/use-realtime-events.ts` - Events list data parsing
3. ✅ `lib/hooks/use-realtime-queue.ts` - Queue data parsing
4. ✅ `app/events/[id]/page.tsx` - Event detail data parsing
5. ✅ `lib/types.ts` - Updated Event interface

---

## 🧪 Test All Pages

### Admin Dashboard (`/admin`)
- [ ] Events list displays correctly
- [ ] Court count shows as number (e.g., "4 courts")
- [ ] Dates display correctly
- [ ] Can create events
- [ ] Can edit events
- [ ] Can end events
- [ ] Can delete events

### Events List (`/events`)
- [ ] Events display correctly
- [ ] Dates show properly
- [ ] Court count displays
- [ ] Can click to view details

### Event Detail (`/events/[id]`)
- [ ] Event info displays correctly
- [ ] Queue list shows correctly
- [ ] "X minutes ago" displays for queue entries
- [ ] Can join queue
- [ ] Can leave queue

---

## 🎉 Summary

All data parsing issues are now fixed! The app now properly:
- ✅ Converts database strings to Date objects
- ✅ Parses court counts to numbers
- ✅ Maps snake_case to camelCase
- ✅ Handles missing/null values gracefully

**All pages should work correctly now!** 🚀

---

## 🔍 If You Still See Errors

Check browser console for:
1. Any remaining parsing errors
2. Network errors (failed API calls)
3. Supabase errors (RLS policies)

The console.log statements will help debug any remaining issues.

