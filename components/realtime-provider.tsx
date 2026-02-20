'use client'

import { createClient } from '@/lib/supabase/client'
import { createContext, useContext, useEffect, useState } from 'react'

const RealtimeContext = createContext<{
  events: any[]
  students: any[]
  teams: any[]
  refreshData: () => void
}>({
  events: [],
  students: [],
  teams: [],
  refreshData: () => {}
})

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchData = async () => {
    try {
      const [eventsRes, studentsRes, teamsRes] = await Promise.all([
        fetch('/api/events', { 
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        }).then(r => r.ok ? r.json() : []),
        fetch('/api/students', { 
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        }).then(r => r.ok ? r.json() : []),
        fetch('/api/teams', { 
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        }).then(r => r.ok ? r.json() : [])
      ])
      
      setEvents(eventsRes || [])
      setStudents(studentsRes || [])
      setTeams(teamsRes || [])
    } catch (error) {
      console.error('Error fetching data:', error)
      // Set empty arrays on error to prevent crashes
      setEvents([])
      setStudents([])
      setTeams([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()

    const channel = supabase
      .channel('realtime-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
        setTimeout(fetchData, 100)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        setTimeout(fetchData, 100)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, () => {
        setTimeout(fetchData, 100)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_members' }, () => {
        setTimeout(fetchData, 100)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <RealtimeContext.Provider value={{ events, students, teams, refreshData: fetchData }}>
      {children}
    </RealtimeContext.Provider>
  )
}

export const useRealtime = () => useContext(RealtimeContext)