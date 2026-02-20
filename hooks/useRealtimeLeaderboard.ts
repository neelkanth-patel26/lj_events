'use client'

import { useEffect } from 'react'
import { subscribeToLeaderboardUpdates } from '@/lib/supabase/realtime'
import type { SWRResponse } from 'swr'

export function useRealtimeLeaderboard(
  eventId: string | null,
  swr: SWRResponse<any, any>
) {
  useEffect(() => {
    if (!eventId) return

    const unsubscribe = subscribeToLeaderboardUpdates(eventId, (payload) => {
      // Revalidate the data when leaderboard changes
      swr.mutate()
    })

    return () => {
      unsubscribe()
    }
  }, [eventId, swr])
}
