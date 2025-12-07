<!-- 8f9b0863-9000-426a-9fbd-a3c8a7cdc9b7 44529b05-4402-44be-9ad8-c34f3a6a8b2b -->
# Replace Native Alerts with Sonner Toast Notifications

## Current State

**Problem:** App uses native browser `alert()` and `confirm()` dialogs (65 instances across 8 files)

**Issues with native alerts:**

- Blocks UI thread
- Can't be styled
- Poor UX on mobile
- No error/success variants
- No positioning control
- Looks outdated
- Can't be dismissed programmatically

**Already installed:** Sonner v1.7.4 (but not configured)

---

## What is Sonner?

**Sonner** is a modern, lightweight toast notification library:

- Beautiful default styling
- Multiple variants (success, error, warning, info)
- Non-blocking
- Stackable notifications
- Mobile-friendly
- Accessible
- Customizable
- Promise-based toasts
- Action buttons support

**Better than react-hot-toast because:**

- Smaller bundle size
- Better TypeScript support
- More modern design
- Better accessibility
- Already installed in your project

---

## Files with alert() Usage

1. `app/admin/page.tsx` - 16 alerts (event CRUD operations)
2. `app/admin/events/[id]/page.tsx` - 17 alerts (queue/court management)
3. `app/admin/users/page.tsx` - 7 alerts (user management)
4. `app/admin/users/[id]/page.tsx` - 9 alerts (user editing)
5. `app/settings/membership/page.tsx` - 9 alerts (subscription management)
6. `app/events/[id]/page.tsx` - 4 alerts (queue join/leave)
7. `app/membership/checkout/page.tsx` - 2 alerts (checkout errors)
8. `app/settings/notifications/page.tsx` - 1 alert (save settings)

---

## Implementation Plan

### Phase 1: Setup Sonner (5 minutes)

#### Step 1: Add Sonner Provider to Root Layout

**File:** `app/layout.tsx`

Add Toaster component:

```typescript
import { Toaster } from "sonner";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
```

#### Step 2: Create Toast Helper Utility

**File:** `lib/toast-helpers.ts`

Create wrapper functions for common patterns:

```typescript
import { toast } from "sonner";

export const showSuccess = (message: string, description?: string) => {
  toast.success(message, { description });
};

export const showError = (message: string, description?: string) => {
  toast.error(message, { description });
};

export const showConfirm = (
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
) => {
  toast(message, {
    action: {
      label: "Confirm",
      onClick: onConfirm,
    },
    cancel: {
      label: "Cancel",
      onClick: onCancel,
    },
  });
};

export const showLoading = (message: string) => {
  return toast.loading(message);
};

export const dismissToast = (id: string | number) => {
  toast.dismiss(id);
};
```

---

### Phase 2: Replace Alerts in Admin Pages (30 minutes)

#### File 1: `app/admin/page.tsx` (16 alerts)

**Replace patterns:**

```typescript
// BEFORE
alert("Event created successfully!");

// AFTER
import { toast } from "sonner";
toast.success("Event created successfully!");

// BEFORE
alert(`Failed to create event: ${error.message}`);

// AFTER
toast.error("Failed to create event", {
  description: error.message
});

// BEFORE
if (!confirm("Are you sure you want to delete this event?")) return;

// AFTER
toast("Delete this event?", {
  description: "This action cannot be undone.",
  action: {
    label: "Delete",
    onClick: () => handleDeleteConfirmed(eventId),
  },
  cancel: {
    label: "Cancel",
  },
});
```

**Instances to replace:**

1. Event created success
2. Event creation error
3. Event updated success
4. Event update error
5. Event ended success
6. Event end error
7. Delete confirmation
8. Delete success
9. Delete error

10-16. Various validation errors

---

#### File 2: `app/admin/events/[id]/page.tsx` (17 alerts)

**Replace patterns:**

1. Assign players success/error
2. Force remove confirmation
3. Force remove success/error
4. Clear queue confirmation
5. Clear queue success/error
6. End game confirmation
7. End game success/error

8-17. Various operation errors

---

#### File 3: `app/admin/users/page.tsx` (7 alerts)

**Replace patterns:**

1. Toggle admin confirmation
2. Toggle admin success/error
3. Delete user confirmation
4. Delete user success/error

5-7. Various errors

---

#### File 4: `app/admin/users/[id]/page.tsx` (9 alerts)

**Replace patterns:**

1. Update user success/error
2. Toggle admin confirmation
3. Toggle admin success/error
4. Delete user confirmation
5. Delete user success/error

6-9. Various errors

---

### Phase 3: Replace Alerts in User Pages (15 minutes)

#### File 5: `app/events/[id]/page.tsx` (4 alerts)

**Replace patterns:**

1. Join queue error
2. Leave queue error
3. Success notifications (already using custom notifications)

---

#### File 6: `app/settings/membership/page.tsx` (9 alerts)

**Replace patterns:**

1. Cancel subscription confirmation
2. Cancel subscription success/error
3. Reactivate subscription success/error
4. Billing portal errors

---

#### File 7: `app/membership/checkout/page.tsx` (2 alerts)

**Replace patterns:**

1. Checkout session error
2. Unexpected error

---

#### File 8: `app/settings/notifications/page.tsx` (1 alert)

**Replace patterns:**

1. Settings saved success

---

### Phase 4: Enhanced Patterns (10 minutes)

#### Loading Toasts with Promise

For async operations:

```typescript
// BEFORE
setLoading(true);
try {
  await someOperation();
  alert("Success!");
} catch (error) {
  alert("Failed!");
} finally {
  setLoading(false);
}

// AFTER
toast.promise(someOperation(), {
  loading: "Processing...",
  success: "Success!",
  error: "Failed!",
});
```

#### Confirmation Dialogs

For destructive actions:

```typescript
// BEFORE
if (!confirm("Are you sure?")) return;
await deleteItem();

// AFTER
toast("Are you sure?", {
  description: "This action cannot be undone.",
  action: {
    label: "Delete",
    onClick: async () => {
      await deleteItem();
      toast.success("Deleted successfully!");
    },
  },
  cancel: { label: "Cancel" },
});
```

---

## Migration Strategy

### Step 1: Setup (Do First)

1. Add Toaster to layout
2. Create toast helper utilities
3. Test basic toast works

### Step 2: Admin Pages (High Priority)

Replace alerts in admin pages first:

- Most alerts are here
- Admins need good feedback
- Critical operations

### Step 3: User Pages (Medium Priority)

Replace alerts in user-facing pages:

- Better UX for end users
- Queue operations
- Membership management

### Step 4: Cleanup (Final)

- Remove any remaining alerts
- Test all flows
- Verify no console errors

---

## Expected Results

### Before:

- 65 native alert() calls
- Blocking dialogs
- Poor mobile UX
- No styling
- No error context

### After:

- 0 native alerts
- Non-blocking toasts
- Beautiful UI
- Color-coded (success=green, error=red)
- Dismissible
- Stackable
- Mobile-optimized

---

## Configuration Options

### Toaster Props

```typescript
<Toaster 
  position="top-right"    // or "bottom-right", "top-center"
  richColors              // Use semantic colors
  closeButton             // Show X button
  duration={4000}         // Auto-dismiss after 4s
  expand={true}           // Expand on hover
  visibleToasts={5}       // Max visible at once
/>
```

### Toast Variants

```typescript
toast.success("Success!");
toast.error("Error!");
toast.warning("Warning!");
toast.info("Info!");
toast.loading("Loading...");
toast.promise(promise, { ... });
```

---

## Benefits

### User Experience

✅ Non-blocking - users can continue working

✅ Beautiful design - matches your app theme

✅ Color-coded - instant visual feedback

✅ Dismissible - users can close early

✅ Stackable - multiple notifications visible

✅ Mobile-friendly - proper touch targets

### Developer Experience

✅ Simple API - `toast.success("Done!")`

✅ Promise support - automatic loading states

✅ TypeScript - full type safety

✅ Customizable - per-toast options

✅ Already installed - no new dependencies

### Performance

✅ Lightweight - ~3KB gzipped

✅ No layout shift - fixed positioning

✅ Optimized animations - smooth 60fps

✅ Lazy loaded - doesn't block initial render

---

## Testing Checklist

After implementation:

- [ ] Success toasts show green
- [ ] Error toasts show red
- [ ] Toasts auto-dismiss after 4s
- [ ] Can manually dismiss toasts
- [ ] Multiple toasts stack properly
- [ ] Works on mobile
- [ ] Accessible (keyboard navigation)
- [ ] No console errors
- [ ] All 65 alerts replaced

---

## Timeline

**Phase 1 (Setup):** 5 minutes

**Phase 2 (Admin pages):** 30 minutes

**Phase 3 (User pages):** 15 minutes

**Phase 4 (Testing):** 10 minutes

**Total:** ~1 hour to replace all 65 alerts

---

## Summary

**Current:** 65 native alert() calls blocking UI

**Solution:** Sonner toast notifications (already installed!)

**Benefit:** Modern, non-blocking, beautiful notifications

**Time:** ~1 hour to implement

**Result:** Professional notification system across entire app

### To-dos

- [ ] Add Sonner Toaster to root layout and create toast helper utilities
- [ ] Replace 16 alerts in app/admin/page.tsx with Sonner toasts
- [ ] Replace 17 alerts in app/admin/events/[id]/page.tsx with Sonner toasts
- [ ] Replace 7 alerts in app/admin/users/page.tsx with Sonner toasts
- [ ] Replace 9 alerts in app/admin/users/[id]/page.tsx with Sonner toasts
- [ ] Replace 9 alerts in app/settings/membership/page.tsx with Sonner toasts
- [ ] Replace 4 alerts in app/events/[id]/page.tsx with Sonner toasts
- [ ] Replace 2 alerts in app/membership/checkout/page.tsx with Sonner toasts
- [ ] Replace 1 alert in app/settings/notifications/page.tsx with Sonner toast
- [ ] Test all toast notifications across the app