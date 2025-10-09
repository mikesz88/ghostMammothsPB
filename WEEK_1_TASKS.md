# Week 1 Tasks - Oct 9-15

## 🎯 Week 1 Goal
Complete Group Queue + Set up Stripe + Basic Membership Pages

---

## Day 1-2: Group Queue (Oct 9-10)

### Task 1: Update Join Queue Dialog
**File:** `components/join-queue-dialog.tsx`

```typescript
// Add these state variables
const [groupSize, setGroupSize] = useState<1 | 2 | 3 | 4>(1);
const [playerNames, setPlayerNames] = useState<string[]>(['']);
const [playerSkillLevels, setPlayerSkillLevels] = useState<string[]>(['']);

// Add radio button group for group size
<div className="space-y-2">
  <Label>Group Size</Label>
  <RadioGroup value={groupSize.toString()} onValueChange={(v) => setGroupSize(Number(v) as 1|2|3|4)}>
    <div className="flex space-x-4">
      <div><RadioGroupItem value="1" /> Solo</div>
      <div><RadioGroupItem value="2" /> Duo</div>
      <div><RadioGroupItem value="3" /> Triple</div>
      <div><RadioGroupItem value="4" /> Quad</div>
    </div>
  </RadioGroup>
</div>

// Show additional player inputs if group > 1
{groupSize > 1 && (
  <div className="space-y-2">
    <Label>Group Members</Label>
    {Array.from({ length: groupSize }).map((_, i) => (
      <div key={i}>
        <Input 
          placeholder={`Player ${i + 1} Name`}
          value={playerNames[i] || ''}
          onChange={(e) => {
            const newNames = [...playerNames];
            newNames[i] = e.target.value;
            setPlayerNames(newNames);
          }}
        />
      </div>
    ))}
  </div>
)}

// Generate group_id when joining
const groupId = groupSize > 1 ? crypto.randomUUID() : undefined;

// Call onJoin with group info
onJoin(playerNames, playerSkillLevels, groupSize, groupId);
```

### Task 2: Update Event Detail Page
**File:** `app/events/[id]/page.tsx`

```typescript
// Display groups in queue
{queue.map((entry) => (
  <div key={entry.id} className={entry.groupId ? "border-l-4 border-blue-500 pl-2" : ""}>
    {entry.groupSize > 1 && (
      <Badge variant="secondary">Group of {entry.groupSize}</Badge>
    )}
    <p>{entry.user?.name}</p>
    <p className="text-sm text-muted-foreground">Position: {entry.position}</p>
  </div>
))}
```

### Task 3: Update Queue Action
**File:** `app/actions/queue.ts`

```typescript
export async function joinQueue(
  eventId: string, 
  userId: string, 
  groupSize: number,
  groupId?: string
) {
  // Existing code...
  
  const { data, error } = await supabase
    .from("queue_entries")
    .insert({
      event_id: eventId,
      user_id: userId,
      group_size: groupSize,
      group_id: groupId,
      position: newPosition,
      status: "waiting",
    })
    .select();
    
  return { data, error };
}
```

### Task 4: Test Group Queue
- [ ] Can join as solo
- [ ] Can join as duo (2 players)
- [ ] Can join as triple (3 players)
- [ ] Can join as quad (4 players)
- [ ] Groups display together in queue
- [ ] Group badge shows correct size

---

## Day 3-4: Stripe Setup (Oct 10-12)

### Task 1: Create Stripe Account
- [ ] Go to https://stripe.com
- [ ] Sign up for account
- [ ] Verify business information
- [ ] Get test API keys
- [ ] Enable test mode

### Task 2: Create Products in Stripe Dashboard
**Product 1: Free Membership**
- Name: "Free Membership"
- Price: $0.00
- Billing: One-time
- Copy Price ID

**Product 2: Monthly Membership**
- Name: "Monthly Membership"
- Price: $35.00 (or your chosen price)
- Billing: Recurring - Monthly
- Copy Price ID

### Task 3: Install Stripe
```bash
npm install stripe @stripe/stripe-js
```

### Task 4: Add Environment Variables
Add to `.env.local`:
```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_MONTHLY_PRICE_ID=price_...
```

### Task 5: Create Stripe Client
**File:** `lib/stripe/client.ts`
```typescript
import { loadStripe } from '@stripe/stripe-js';

export const getStripe = () => {
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
};
```

### Task 6: Create Stripe Server
**File:** `lib/stripe/server.ts`
```typescript
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
  typescript: true,
});
```

### Task 7: Test Stripe Connection
Create test file: `lib/stripe/__test__.ts`
```typescript
import { stripe } from './server';

async function test() {
  const products = await stripe.products.list();
  console.log('Stripe connected:', products.data);
}

test();
```

Run: `npx tsx lib/stripe/__test__.ts`

---

## Day 5-6: Membership Pages (Oct 13-14)

### Task 1: Create Membership Page
**File:** `app/membership/page.tsx`

```typescript
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";

export default function MembershipPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Membership Plans</h1>
      
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Free Tier */}
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-4">Free Member</h2>
          <p className="text-3xl font-bold mb-4">$0<span className="text-sm">/month</span></p>
          <ul className="space-y-2 mb-6">
            <li className="flex items-center"><Check className="mr-2" />Can join free events</li>
            <li className="flex items-center"><Check className="mr-2" />Pay per paid event</li>
            <li className="flex items-center"><Check className="mr-2" />Basic features</li>
          </ul>
          <Button variant="outline" className="w-full" disabled>Current Plan</Button>
        </Card>
        
        {/* Paid Tier */}
        <Card className="p-6 border-primary">
          <h2 className="text-2xl font-bold mb-4">Monthly Member</h2>
          <p className="text-3xl font-bold mb-4">$35<span className="text-sm">/month</span></p>
          <ul className="space-y-2 mb-6">
            <li className="flex items-center"><Check className="mr-2" />Free entry to ALL events</li>
            <li className="flex items-center"><Check className="mr-2" />Priority queue position</li>
            <li className="flex items-center"><Check className="mr-2" />Exclusive events</li>
            <li className="flex items-center"><Check className="mr-2" />10% merchandise discount</li>
          </ul>
          <Button className="w-full" asChild>
            <Link href="/membership/checkout">Upgrade Now</Link>
          </Button>
        </Card>
      </div>
    </div>
  );
}
```

### Task 2: Create Checkout Page
**File:** `app/membership/checkout/page.tsx`

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  
  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-md mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Upgrade to Monthly</h1>
        <p className="mb-4">$35/month - Cancel anytime</p>
        <Button onClick={handleCheckout} disabled={loading} className="w-full">
          {loading ? "Loading..." : "Continue to Payment"}
        </Button>
      </Card>
    </div>
  );
}
```

### Task 3: Create Checkout API
**File:** `app/api/stripe/create-checkout/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { createClient } from '@/lib/supabase/server';

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const session = await stripe.checkout.sessions.create({
    customer_email: user.email,
    line_items: [{
      price: process.env.STRIPE_MONTHLY_PRICE_ID!,
      quantity: 1,
    }],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_URL}/membership/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/membership`,
    metadata: {
      user_id: user.id,
    },
  });
  
  return NextResponse.json({ url: session.url });
}
```

### Task 4: Create Success Page
**File:** `app/membership/success/page.tsx`

```typescript
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <Card className="max-w-md mx-auto p-6 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold mb-4">Welcome to Monthly Membership!</h1>
        <p className="mb-6">Your subscription is now active. Enjoy free access to all events!</p>
        <Button asChild className="w-full">
          <Link href="/events">Browse Events</Link>
        </Button>
      </Card>
    </div>
  );
}
```

---

## Day 7: Webhook Handler (Oct 15)

### Task 1: Create Webhook Route
**File:** `app/api/webhooks/stripe/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/server';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }
  
  const supabase = await createClient();
  
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionUpdate(subscription, supabase);
      break;
      
    case 'customer.subscription.deleted':
      const deletedSub = event.data.object as Stripe.Subscription;
      await handleSubscriptionCancellation(deletedSub, supabase);
      break;
  }
  
  return NextResponse.json({ received: true });
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription, supabase: any) {
  const userId = subscription.metadata.user_id;
  
  await supabase
    .from('user_memberships')
    .upsert({
      user_id: userId,
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer as string,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
    });
}

async function handleSubscriptionCancellation(subscription: Stripe.Subscription, supabase: any) {
  await supabase
    .from('user_memberships')
    .update({ status: 'cancelled' })
    .eq('stripe_subscription_id', subscription.id);
}
```

### Task 2: Configure Webhook in Stripe
- [ ] Go to Stripe Dashboard → Webhooks
- [ ] Add endpoint: `https://your-domain.com/api/webhooks/stripe`
- [ ] Select events:
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`
- [ ] Copy webhook secret to `.env.local`

### Task 3: Test Webhook with Stripe CLI
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:3001/api/webhooks/stripe

# Trigger test event
stripe trigger customer.subscription.created
```

---

## End of Week 1 Checklist

- [ ] Group queue UI works (solo, duo, triple, quad)
- [ ] Stripe account created and configured
- [ ] Membership page displays pricing
- [ ] Checkout flow creates Stripe session
- [ ] Webhook handler receives and processes events
- [ ] Test subscription created in Stripe dashboard
- [ ] User membership updated in database

**If all checked → GREAT! Move to Week 2**  
**If missing items → Prioritize and finish over weekend**

---

## Quick Start Commands

```bash
# Run dev server
npm run dev

# Test Stripe webhooks (separate terminal)
stripe listen --forward-to localhost:3001/api/webhooks/stripe

# Check database
# Open Supabase dashboard → Table Editor

# Test payment (use Stripe test card)
4242 4242 4242 4242
Any future date
Any 3 digits CVC
Any ZIP code
```

