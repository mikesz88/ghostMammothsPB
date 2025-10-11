# Event Creation Fix - Time Column Issue

## 🐛 Problem
Error: `null value in column "time" of relation "events" violates not-null constraint`

## 🔍 Root Cause
Your Supabase database has a `time` column (separate from `date`) that is marked as NOT NULL, but the code wasn't providing it.

## ✅ Solution Applied

### Code Changes:
**File:** `app/admin/page.tsx`

1. **Create Event** - Now extracts and sends time:
```typescript
const eventDateTime = new Date(eventData.date);
const timeOnly = eventDateTime.toTimeString().split(' ')[0]; // HH:MM:SS

await supabase.from("events").insert({
  name: eventData.name,
  location: eventData.location,
  date: eventData.date.toISOString(),
  time: timeOnly, // ✅ Now included
  court_count: eventData.courtCount,
  rotation_type: eventData.rotationType,
  status: eventData.status,
});
```

2. **Update Event** - Also includes time:
```typescript
const timeOnly = eventDateTime.toTimeString().split(' ')[0];

await supabase.from("events").update({
  // ... other fields
  time: timeOnly, // ✅ Now included
});
```

3. **TypeScript Types** - Updated Event interface:
```typescript
export interface Event {
  // ... other fields
  time?: string // ✅ Added optional time field
}
```

## 🎯 How It Works Now

When creating an event:
1. User enters date and time in the form
2. Form combines them into a JavaScript Date object
3. Code extracts:
   - `date`: Full ISO timestamp (e.g., "2025-10-15T14:30:00.000Z")
   - `time`: Time only (e.g., "14:30:00")
4. Both are sent to Supabase
5. Database constraint is satisfied

## 🧪 Test Now

1. Go to `/admin`
2. Click "Create Event"
3. Fill in all fields:
   - Event Name: "Test Event"
   - Location: "Test Location"
   - Date: Pick a date
   - Time: Pick a time
   - Courts: 4
   - Rotation: 2-stay-4-off
4. Click "Create Event"
5. Should see "Event created successfully!" alert
6. Event should appear in the list

## 📊 What Was Fixed

- ✅ Added `time` column to insert statement
- ✅ Extracts time from Date object
- ✅ Formats as HH:MM:SS
- ✅ Added to both create and update operations
- ✅ Updated TypeScript types
- ✅ Added comprehensive error handling
- ✅ Added console logging for debugging

## 🔧 Alternative: Database Schema Fix

If you want to simplify the schema (recommended), you can run:

```sql
-- Option 1: Make time nullable (keeps column but optional)
ALTER TABLE events ALTER COLUMN time DROP NOT NULL;

-- Option 2: Remove time column entirely (cleaner - date already has time)
ALTER TABLE events DROP COLUMN IF EXISTS time;
```

**Recommendation:** Keep the current code fix (it works with your existing schema). If you want to clean up the schema later, you can remove the `time` column and update the code accordingly.

## ✅ Status

**Event creation should work now!** The code now provides the required `time` column.

Try creating an event and let me know if you see any other errors!

