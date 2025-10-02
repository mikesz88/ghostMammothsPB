# Supabase Real-time Setup Guide

When you're ready to connect Supabase for true real-time updates, follow these steps:

## 1. Enable Real-time on Tables

In your Supabase dashboard, enable real-time for these tables:
- `events`
- `queue_entries`
- `court_assignments`

## 2. Create Supabase Client Hooks

\`\`\`typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// lib/supabase/use-realtime-queue.ts
import { useEffect, useState } from 'react'
import { createClient } from './client'
import type { QueueEntry } from '../types'

export function useRealtimeQueue(eventId: string) {
  const [queue, setQueue] = useState<QueueEntry[]>([])
  const supabase = createClient()

  useEffect(() => {
    // Initial fetch
    supabase
      .from('queue_entries')
      .select('*, user:users(*)')
      .eq('event_id', eventId)
      .eq('status', 'waiting')
      .order('position')
      .then(({ data }) => setQueue(data || []))

    // Subscribe to changes
    const channel = supabase
      .channel(`queue:${eventId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'queue_entries',
          filter: `event_id=eq.${eventId}`,
        },
        () => {
          // Refetch on any change
          supabase
            .from('queue_entries')
            .select('*, user:users(*)')
            .eq('event_id', eventId)
            .eq('status', 'waiting')
            .order('position')
            .then(({ data }) => setQueue(data || []))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [eventId])

  return queue
}
\`\`\`

## 3. Replace Mock Data with Real Queries

Replace the mock data in your components with actual Supabase queries:

\`\`\`typescript
// Instead of:
const [queue, setQueue] = useState<QueueEntry[]>(mockQueue)

// Use:
const queue = useRealtimeQueue(eventId)
\`\`\`

## 4. Implement Server Actions

Create server actions for mutations:

\`\`\`typescript
// app/actions/queue.ts
'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function joinQueue(eventId: string, userId: string, groupSize: number) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookies().get(name)?.value
        },
      },
    }
  )

  const { data, error } = await supabase
    .from('queue_entries')
    .insert({
      event_id: eventId,
      user_id: userId,
      group_size: groupSize,
      status: 'waiting',
    })
    .select()

  return { data, error }
}
\`\`\`

## 5. Add Push Notifications

For mobile push notifications, integrate with a service like:
- Firebase Cloud Messaging (FCM)
- OneSignal
- Pusher Beams

These services can send notifications even when the browser is closed.
