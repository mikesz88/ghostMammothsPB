# Admin Pages - Supabase Integration Fix

## ✅ Fixed: Admin Dashboard (`app/admin/page.tsx`)

### Changes Made:
1. **Removed mock data** - Deleted hardcoded `mockEvents` array
2. **Added Supabase integration** - Now fetches real events from database
3. **Added loading state** - Shows spinner while loading
4. **Updated all CRUD operations**:
   - ✅ Create Event - Inserts into Supabase
   - ✅ Update Event - Updates in Supabase
   - ✅ End Event - Updates status to "ended"
   - ✅ Delete Event - Deletes from Supabase
5. **Auto-refresh** - Fetches fresh data after each operation

### What Works Now:
- Events list pulls from Supabase `events` table
- Create event saves to database
- Edit event updates database
- End event changes status
- Delete event removes from database
- Loading spinner shows while fetching

---

## ⚠️ Still Needs Fix: Admin Event Detail (`app/admin/events/[id]/page.tsx`)

### Current Issues:
- ❌ Uses mock event data
- ❌ Uses mock queue data
- ❌ Uses mock court assignments
- ❌ Uses mock users list
- ❌ All operations only update local state, not database

### What Needs to be Done:
1. Fetch event from Supabase by ID
2. Use `useRealtimeQueue` hook for queue (already exists!)
3. Fetch court assignments from Supabase
4. Update `handleAssignNext` to save to database
5. Update `handleCompleteGame` to save to database
6. Update `handleForceRemove` to use queue action
7. Update `handleClearQueue` to delete from database

---

## Quick Fix for Admin Event Detail

The admin event detail page needs similar changes. Here's what to do:

### 1. Replace mock data with Supabase fetching:
```typescript
// Remove mock data at top of file
// Add these imports:
import { useRealtimeQueue } from "@/lib/hooks/use-realtime-queue";
import { createClient } from "@/lib/supabase/client";
import { leaveQueue } from "@/app/actions/queue";

// In component:
const [event, setEvent] = useState<Event | null>(null);
const [loading, setLoading] = useState(true);
const { queue, loading: queueLoading } = useRealtimeQueue(id);

useEffect(() => {
  const fetchEvent = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single();
    
    if (error) {
      console.error("Error fetching event:", error);
    } else {
      setEvent(data);
    }
    setLoading(false);
  };
  
  fetchEvent();
}, [id]);
```

### 2. Update handleForceRemove to use real action:
```typescript
const handleForceRemove = async (entryId: string) => {
  if (!confirm("Are you sure you want to remove this player from the queue?")) {
    return;
  }
  
  const { error } = await leaveQueue(entryId);
  
  if (error) {
    console.error("Error removing from queue:", error);
    alert("Failed to remove player from queue.");
  }
  // Queue will auto-update via real-time subscription
};
```

### 3. Court assignments need similar treatment:
- Fetch from `court_assignments` table
- Use real-time subscription for updates
- Save assignments when creating them

---

## Summary

**Fixed:**
- ✅ Admin dashboard now uses Supabase

**Still TODO:**
- ⚠️ Admin event detail page needs Supabase integration
- ⚠️ Court assignment operations need database integration

**Estimated time to fix admin event detail:** 2-3 hours

---

## Testing Checklist

### Admin Dashboard (READY TO TEST)
- [ ] Can see events from database
- [ ] Can create new event
- [ ] Can edit existing event
- [ ] Can end event
- [ ] Can delete event
- [ ] Loading state shows correctly

### Admin Event Detail (NEEDS FIX FIRST)
- [ ] Shows real event data
- [ ] Shows real queue
- [ ] Can assign players to courts
- [ ] Can complete games
- [ ] Can force remove from queue
- [ ] Can clear queue

