"use client"

import { useEffect, useRef } from "react"

interface UseQueuePollingOptions {
  onUpdate: () => void
  interval?: number
  enabled?: boolean
}

export function useQueuePolling({ onUpdate, interval = 5000, enabled = true }: UseQueuePollingOptions) {
  const intervalRef = useRef<NodeJS.Timeout>(undefined)

  useEffect(() => {
    if (!enabled) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      return
    }

    intervalRef.current = setInterval(() => {
      onUpdate()
    }, interval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [onUpdate, interval, enabled])
}
