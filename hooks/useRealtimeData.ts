'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useRealtimeData(callback: () => void, tables: string[] = ['events', 'teams', 'users', 'team_members', 'judging_criteria']) {
  useEffect(() => {
    const supabase = createClient()
    const channels: any[] = []

    tables.forEach(table => {
      const channel = supabase
        .channel(`${table}-changes`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: table,
          },
          () => {
            callback()
          }
        )
        .subscribe()
      
      channels.push(channel)
    })

    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel)
      })
    }
  }, [callback, tables])
}
