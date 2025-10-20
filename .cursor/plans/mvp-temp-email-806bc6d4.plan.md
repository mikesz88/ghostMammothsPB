<!-- 806bc6d4-dd45-40c3-b10a-733163e23cd0 66c24c9f-0ef0-4ae3-89a7-819b84d69e88 -->
# MVP: Temporary Email Accounts (Solo Players Only)

## Overview

Simplify the app to support temporary, event-specific accounts using email addresses. Remove all team/group functionality to focus on solo players only. This avoids team bugs and aligns with the client's vision for temporary open play sessions.

## Branch Strategy

Create new branch `mvp-temp-accounts` from current state to preserve existing functionality:

```bash
git checkout -b mvp-temp-accounts
```

Configure Vercel to deploy from this branch instead of main/update-pages.

## Phase 1: Database Changes

### Create Migration Script: `scripts/13-mvp-temp-accounts.sql`

```sql
-- Add temporary account flags to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_temp BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES events(id) ON DELETE CASCADE;

-- Make email nullable for flexibility (though temp accounts will use email)
-- This allows future expansion if needed
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

-- Add indexes for efficient temp account lookups
CREATE INDEX IF NOT EXISTS idx_users_temp ON users(is_temp) WHERE is_temp = true;
CREATE INDEX IF NOT EXISTS idx_users_event ON users(event_id) WHERE event_id IS NOT NULL;

-- Add constraint to ensure temp accounts have event_id
ALTER TABLE users ADD CONSTRAINT temp_accounts_have_event 
  CHECK (is_temp = false OR event_id IS NOT NULL);
```

**Testing:** Run migration on local Supabase, verify indexes created, test constraint by attempting to create temp user without event_id (should fail).

## Phase 2: Core Functionality - Temp Account System

### Create: `lib/temp-accounts.ts`

New helper module for managing temporary accounts:

```typescript
import { createClient } from '@/lib/supabase/client';

export async function createOrGetTempAccount(
  email: string,
  eventId: string,
  skillLevel: string = 'intermediate'
) {
  const supabase = createClient();
  
  // Check if temp account already exists for this email + event combination
  const { data: existing } = await supabase
    .from('users')
    .select('id, name, email')
    .eq('email', email.toLowerCase().trim())
    .eq('event_id', eventId)
    .eq('is_temp', true)
    .maybeSingle();
    
  if (existing) {
    return { data: existing, error: null };
  }
  
  // Create new temp account
  const name = email.split('@')[0]; // Use email prefix as name
  const { data, error } = await supabase
    .from('users')
    .insert({
      email: email.toLowerCase().trim(),
      name: name,
      is_temp: true,
      event_id: eventId,
      skill_level: skillLevel,
      is_admin: false
    })
    .select('id, name, email')
    .single();
    
  if (error) {
    console.error('Error creating temp account:', error);
    return { data: null, error: error.message };
  }
    
  return { data, error: null };
}

export async function deleteTempAccountsForEvent(eventId: string) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('event_id', eventId)
    .eq('is_temp', true);
    
  if (error) {
    console.error('Error deleting temp accounts:', error);
    return { error: error.message };
  }
  
  return { error: null };
}
```

## Phase 3: Simplify Join Queue (Remove Team Logic)

### Update: `components/join-queue-dialog.tsx`

**Remove:**

- Group size selection (lines 42-123)
- Team alerts (lines 125-148)
- Multiple player inputs (lines 150-199)
- All group-related state and logic

**Replace with:**

```typescript
interface JoinQueueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJoin: (email: string, skillLevel: string) => void;
}

export function JoinQueueDialog({ open, onOpenChange, onJoin }: JoinQueueDialogProps) {
  const [email, setEmail] = useState("");
  const [skillLevel, setSkillLevel] = useState("intermediate");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic email validation
    if (!email.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    onJoin(email.trim().toLowerCase(), skillLevel);
    
    // Reset form
    setEmail("");
    setSkillLevel("intermediate");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Join Queue</DialogTitle>
          <DialogDescription>
            Enter your email to join this session. You'll receive updates about your position and court assignment.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="skill">Skill Level</Label>
            <Select value={skillLevel} onValueChange={setSkillLevel}>
              <SelectTrigger id="skill">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Join Queue
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

## Phase 4: Update Queue Actions (No Authentication Required)

### Update: `app/actions/queue.ts`

**Modify `joinQueue()` function (lines 30-84):**

```typescript
export async function joinQueue(
  eventId: string,
  email: string,
  skillLevel: string
) {
  const supabase = await createClient();
  
  // Create or get temp account for this email + event
  const { data: tempUser, error: accountError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email.toLowerCase().trim())
    .eq('event_id', eventId)
    .eq('is_temp', true)
    .maybeSingle();
    
  let userId = tempUser?.id;
  
  // Create temp account if doesn't exist
  if (!userId) {
    const name = email.split('@')[0];
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert({
        email: email.toLowerCase().trim(),
        name: name,
        is_temp: true,
        event_id: eventId,
        skill_level: skillLevel,
        is_admin: false
      })
      .select('id')
      .single();
      
    if (createError) {
      console.error('Error creating temp account:', createError);
      return { error: 'Failed to create account: ' + createError.message };
    }
    
    userId = newUser?.id;
  }
  
  if (!userId) {
    return { error: 'Failed to create or find user account' };
  }
  
  // Check if already in queue
  const { data: existingEntry } = await supabase
    .from('queue_entries')
    .select('id')
    .eq('event_id', eventId)
    .eq('user_id', userId)
    .eq('status', 'waiting')
    .maybeSingle();
    
  if (existingEntry) {
    return { error: 'You are already in the queue for this event' };
  }

  // Get current queue length to determine position
  const { data: currentQueue } = await supabase
    .from('queue_entries')
    .select('position')
    .eq('event_id', eventId)
    .eq('status', 'waiting')
    .order('position', { ascending: false })
    .limit(1);

  const position = currentQueue?.[0]?.position ? currentQueue[0].position + 1 : 1;

  // Insert queue entry (always solo - no groups)
  const { data, error } = await supabase
    .from('queue_entries')
    .insert({
      event_id: eventId,
      user_id: userId,
      group_id: null,      // Always null for solo
      group_size: 1,        // Always 1 for solo
      position: position,
      status: 'waiting',
    })
    .select()
    .single();

  if (error) {
    console.error('Error joining queue:', error);
    return { error: error.message };
  }

  // Send email notification
  sendQueueNotification(userId, eventId, position, 'join').catch((err) =>
    console.error('Failed to send join email:', err)
  );

  revalidatePath(`/events/${eventId}`);
  return { data, error: null };
}
```

**Remove group handling from `adminRemoveFromQueue()` (lines 268-286):**

Simplify to only delete single entry (remove the group_id check and group deletion logic).

## Phase 5: Simplify Queue Manager (Remove Group Logic)

### Update: `lib/queue-manager.ts`

**Simplify `getNextPlayers()` method (lines 72-96):**

```typescript
private static getNextPlayers(
  queue: QueueEntry[],
  count: number
): QueueEntry[] {
  // Simplified: all players are solo, just take first N
  return queue.slice(0, count);
}
```

Remove all references to `processedGroups`, `groupMembers`, and group filtering logic.

## Phase 6: Event Cleanup (Delete Temp Accounts)

### Update: `app/admin/page.tsx`

**Add to `handleDeleteEvent()` function:**

```typescript
const handleDeleteEvent = async (eventId: string) => {
  try {
    const supabase = createClient();
    
    // Delete temp accounts for this event FIRST
    await supabase
      .from('users')
      .delete()
      .eq('event_id', eventId)
      .eq('is_temp', true);
    
    // Then delete the event (cascades to queue_entries and court_assignments)
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
      return;
    }

    toast.success('Event deleted successfully');
    fetchEvents();
  } catch (err) {
    console.error('Error deleting event:', err);
    toast.error('An unexpected error occurred');
  }
};
```

**Add to `handleEndEvent()` function:**

```typescript
const handleEndEvent = async (eventId: string) => {
  try {
    const supabase = createClient();
    
    // Update event status
    const { error } = await supabase
      .from('events')
      .update({ status: 'ended' })
      .eq('id', eventId);

    if (error) {
      console.error('Error ending event:', error);
      toast.error('Failed to end event');
      return;
    }
    
    // Delete temp accounts after event ends
    await supabase
      .from('users')
      .delete()
      .eq('event_id', eventId)
      .eq('is_temp', true);

    toast.success('Event ended successfully. Temporary accounts cleaned up.');
    fetchEvents();
  } catch (err) {
    console.error('Error ending event:', err);
    toast.error('An unexpected error occurred');
  }
};
```

## Phase 7: Update Event Detail Page

### Update: `app/events/[id]/page.tsx`

**Remove authentication checks:**

- Remove membership tier checking (lines 249-262)
- Remove `canJoin`, `joinReason`, `requiresPayment`, `paymentAmount` state
- Remove payment-related UI (lines 593-613)

**Update `handleJoinQueue()` (lines 311-388):**

```typescript
const handleJoinQueue = async (
  email: string,
  skillLevel: string
) => {
  try {
    // Call simplified joinQueue action
    const { error } = await joinQueue(id, email, skillLevel);

    if (error) {
      console.error('Error joining queue:', error);
      toast.error('Failed to join queue', {
        description: error,
      });
    } else {
      setShowJoinDialog(false);
      await refetchQueue();
      
      toast.success('Successfully joined queue', {
        description: 'You will receive email updates about your position and court assignment.',
      });
    }
  } catch (err) {
    console.error('Error joining queue:', err);
    toast.error('An unexpected error occurred');
  }
};
```

**Update dialog props (line 643):**

```typescript
<JoinQueueDialog
  open={showJoinDialog}
  onOpenChange={setShowJoinDialog}
  onJoin={handleJoinQueue}
/>
```

**Replace "Join Queue" button section (lines 591-623) to remove auth requirement:**

```typescript
{!userPosition ? (
  <Button onClick={() => setShowJoinDialog(true)}>
    Join Queue
  </Button>
) : (
  <Badge variant="default" className="text-sm">
    <Bell className="w-3 h-3 mr-1" />
    You're #{userPosition}
  </Badge>
)}
```

## Phase 8: Simplify Navigation

### Update: `components/ui/header.tsx`

**Modify `DefaultNav` component (lines 95-124):**

Remove:

- Calendar link (lines 103-108)
- About link (lines 109-114)
- Shop link (lines 115-123)

Keep only:

- Events link
```typescript
const DefaultNav = () => (
  <nav className="flex items-center gap-4">
    <Link
      href="/events"
      className="text-muted-foreground hover:text-foreground transition-colors"
    >
      Events
    </Link>
    {isAdmin && (
      <Link
        href="/admin"
        className="text-foreground font-medium flex items-center gap-1"
      >
        <Shield className="w-4 h-4" />
        Admin
      </Link>
    )}
  </nav>
);
```


**Remove Settings from user dropdown menu** (find and remove Settings menu item around line 231-236).

## Phase 9: Simplify Homepage

### Update: `app/page.tsx`

Replace content to show active events directly (similar to `/events` page):

- Remove hero section with Sign Up / Login buttons
- Show list of active events
- Each event card has "Join Queue" button
- Add admin dashboard button (for admins only)

## Phase 10: Add Redirects to Non-MVP Pages

Create redirect component to reuse:

### Create: `components/redirect-to-events.tsx`

```typescript
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectToEvents() {
  const router = useRouter();
  useEffect(() => {
    router.push('/events');
  }, [router]);
  return null;
}
```

### Update these page files to use redirect:

- `app/settings/page.tsx`
- `app/settings/membership/page.tsx`
- `app/settings/notifications/page.tsx`
- `app/membership/page.tsx`
- `app/membership/checkout/page.tsx`
- `app/membership/success/page.tsx`
- `app/membership/cancel/page.tsx`
- `app/calendar/page.tsx`
- `app/about/page.tsx`

Replace contents with:

```typescript
import RedirectToEvents from '@/components/redirect-to-events';

export default function Page() {
  return <RedirectToEvents />;
}
```

## Phase 11: Update Login/Signup Pages

### Update: `app/login/page.tsx` and `app/signup/page.tsx`

Add alert at top of form:

```typescript
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield } from "lucide-react";

// Add before the form
<Alert>
  <Shield className="w-4 h-4" />
  <AlertDescription>
    Admin login only. Regular users can join events directly without creating an account.
  </AlertDescription>
</Alert>
```

## Testing Checklist

1. Create new event as admin
2. Visit event page (not logged in)
3. Click "Join Queue"
4. Enter email address and skill level
5. Verify temp account created in database
6. Verify user added to queue
7. Verify queue join email received
8. Admin assigns player to court
9. Verify court assignment email received
10. Admin ends event
11. Verify temp accounts deleted from database
12. Verify redirects work for settings/membership/calendar pages
13. Verify navigation only shows Events (and Admin for admins)
14. Verify login/signup show admin-only notice

## Files Modified Summary

**New Files:**

- `scripts/13-mvp-temp-accounts.sql`
- `lib/temp-accounts.ts`
- `components/redirect-to-events.tsx`

**Modified Files:**

- `components/join-queue-dialog.tsx` - Simplify to email + skill only
- `app/actions/queue.ts` - Remove auth requirement, add temp account creation
- `lib/queue-manager.ts` - Remove group logic
- `app/admin/page.tsx` - Add temp account cleanup
- `app/events/[id]/page.tsx` - Remove auth/membership checks
- `components/ui/header.tsx` - Simplify navigation
- `app/page.tsx` - Show events list instead of hero
- `app/login/page.tsx` - Add admin-only notice
- `app/signup/page.tsx` - Add admin-only notice
- `app/settings/page.tsx` - Add redirect
- `app/settings/membership/page.tsx` - Add redirect
- `app/settings/notifications/page.tsx` - Add redirect
- `app/membership/page.tsx` - Add redirect
- `app/membership/checkout/page.tsx` - Add redirect
- `app/membership/success/page.tsx` - Add redirect
- `app/membership/cancel/page.tsx` - Add redirect
- `app/calendar/page.tsx` - Add redirect
- `app/about/page.tsx` - Add redirect (if exists)

## Admin Functionality (Unchanged)

All admin features remain intact:

- Admin authentication
- Event management (create, edit, delete, end)
- User management
- Queue management
- Court assignments
- Email statistics dashboard

### To-dos

- [ ] Create and run database migration to add is_temp and event_id columns with indexes
- [ ] Create temp account helper functions in lib/temp-accounts.ts
- [ ] Simplify join queue dialog to email + skill level only (remove all team logic)
- [ ] Update queue actions to create temp accounts and remove authentication requirements
- [ ] Remove group logic from queue manager getNextPlayers method
- [ ] Add temp account deletion to event end and delete handlers
- [ ] Remove authentication and membership checks from event detail page
- [ ] Remove Calendar, About, Shop, Settings from header navigation
- [ ] Replace homepage hero with active events list
- [ ] Create redirect component and apply to settings, membership, calendar, about pages
- [ ] Add admin-only notices to login and signup pages
- [ ] Complete full testing checklist from user join to account cleanup