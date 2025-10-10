# Supabase Real-time Setup Guide

## 🔄 Current Status

**Manual Refetch:** ✅ Implemented as fallback
- Queue refetches immediately after join/leave
- Works even if real-time is disabled

**Real-time Subscription:** ⚠️ May need to be enabled in Supabase

---

## 🚀 Enable Real-time in Supabase

### Step 1: Enable Real-time for Tables

Go to **Supabase Dashboard → Database → Replication**

Enable real-time for these tables:
- ✅ `queue_entries`
- ✅ `events`
- ✅ `court_assignments`

**How to enable:**
1. Find each table in the list
2. Toggle the switch to enable replication
3. Click "Save"

### Step 2: Verify Real-time is Working

Open browser console and check for:
```
Queue subscription status: SUBSCRIBED
```

If you see `SUBSCRIBED`, real-time is working!

If you see errors, real-time might not be enabled.

---

## 🔍 How It Works Now

### With Real-time Enabled (Ideal)
1. User leaves queue
2. Database updates
3. Real-time subscription detects change
4. Queue automatically refetches
5. UI updates instantly

### Without Real-time (Fallback)
1. User leaves queue
2. Database updates
3. **Manual refetch triggered** ✅
4. Queue refetches
5. UI updates instantly

**Either way, the UI updates!** The manual refetch ensures it works even if real-time isn't enabled.

---

## 📊 Real-time Subscription Details

### Queue Subscription
**File:** `lib/hooks/use-realtime-queue.ts`

```typescript
const channel = supabase
  .channel(`queue:${eventId}`)
  .on(
    "postgres_changes",
    {
      event: "*",                    // All events (INSERT, UPDATE, DELETE)
      schema: "public",
      table: "queue_entries",
      filter: `event_id=eq.${eventId}`, // Only this event's queue
    },
    (payload) => {
      console.log("Queue change detected:", payload);
      fetchQueue(); // Refetch when change detected
    }
  )
  .subscribe((status) => {
    console.log("Queue subscription status:", status);
  });
```

### Events Subscription
**File:** `lib/hooks/use-realtime-events.ts`

```typescript
const channel = supabase
  .channel("events")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "events",
    },
    () => {
      fetchEvents(); // Refetch when any event changes
    }
  )
  .subscribe();
```

---

## 🧪 Testing Real-time

### Test 1: Queue Updates
1. Open event page in two browser tabs
2. Join queue in Tab 1
3. Check Tab 2 - should see new entry appear (within 1-2 seconds)
4. Leave queue in Tab 1
5. Check Tab 2 - should see entry disappear

### Test 2: Check Console
Open DevTools (F12) and look for:
```
Queue subscription status: SUBSCRIBED
Queue change detected: { eventType: "DELETE", ... }
```

If you see these logs, real-time is working!

### Test 3: Network Tab
1. Open DevTools → Network tab
2. Filter by "WS" (WebSocket)
3. Should see a WebSocket connection to Supabase
4. This is the real-time connection

---

## ⚡ Performance Notes

### With Real-time:
- ✅ Instant updates across all users
- ✅ No polling needed
- ✅ Efficient (only sends changes)
- ✅ Scales well

### With Manual Refetch Only:
- ✅ Still works perfectly for single user
- ✅ Updates immediately after actions
- ⚠️ Other users won't see changes until they refresh
- ⚠️ Not ideal for multi-user scenarios

---

## 🎯 Current Implementation

**Best of both worlds:**
1. Real-time subscription for automatic updates (if enabled)
2. Manual refetch after user actions (always works)

This means:
- ✅ Your own actions update immediately (manual refetch)
- ✅ Other users' actions update automatically (if real-time enabled)
- ✅ Graceful fallback if real-time isn't enabled

---

## 🔧 Troubleshooting

### Real-time Not Working?

**Check 1: Is replication enabled?**
- Go to Database → Replication
- Verify `queue_entries` and `events` are enabled

**Check 2: Are there console errors?**
- Look for "subscription" errors
- Look for "realtime" errors

**Check 3: Is manual refetch working?**
- After leaving queue, does UI update?
- If yes, manual refetch is working (good!)
- If no, check the console for errors

### Still Having Issues?

Run this in browser console:
```javascript
const supabase = createClient();
const channel = supabase
  .channel('test')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'queue_entries' },
    (payload) => console.log('Change:', payload)
  )
  .subscribe((status) => console.log('Status:', status));
```

Should log: `Status: SUBSCRIBED`

---

## ✅ Summary

**Current Status:**
- ✅ Manual refetch implemented (works immediately)
- ✅ Real-time subscription set up (works if enabled)
- ✅ Console logging added for debugging
- ✅ Graceful fallback if real-time unavailable

**Action Items:**
1. Enable replication in Supabase Dashboard (optional but recommended)
2. Check console for subscription status
3. Test queue join/leave - should update immediately
4. Test multi-tab scenario to verify real-time

**The queue UI will update immediately now, with or without real-time enabled!** 🚀

