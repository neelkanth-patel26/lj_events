import { createClient } from './client'
import type { RealtimeChannel } from '@supabase/supabase-js'

let channel: RealtimeChannel | null = null

export function subscribeToScoreUpdates(
  eventId: string,
  callback: (payload: any) => void
) {
  const supabase = createClient()

  // Unsubscribe from previous channel if exists
  if (channel) {
    supabase.removeChannel(channel)
  }

  channel = supabase
    .channel(`scores:${eventId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'scores',
        filter: `team_id=in.(SELECT id FROM teams WHERE event_id = '${eventId}')`,
      },
      (payload) => {
        callback(payload)
      }
    )
    .subscribe()

  return () => {
    if (channel) {
      supabase.removeChannel(channel)
      channel = null
    }
  }
}

export function subscribeToTeamUpdates(
  eventId: string,
  callback: (payload: any) => void
) {
  const supabase = createClient()

  const channel = supabase
    .channel(`teams:${eventId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'teams',
        filter: `event_id=eq.${eventId}`,
      },
      (payload) => {
        callback(payload)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

export function subscribeToLeaderboardUpdates(
  eventId: string,
  callback: (payload: any) => void
) {
  const supabase = createClient()

  const channel = supabase
    .channel(`leaderboard:${eventId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'leaderboard',
        filter: `event_id=eq.${eventId}`,
      },
      (payload) => {
        callback(payload)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
