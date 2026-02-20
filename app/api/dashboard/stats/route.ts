import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const [events, activeEvents, teams, users] = await Promise.all([
    supabase.from('events').select('id', { count: 'exact', head: true }),
    supabase.from('events').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('teams').select('id', { count: 'exact', head: true }),
    supabase.from('users').select('id', { count: 'exact', head: true }),
  ])

  return NextResponse.json({
    totalEvents: events.count || 0,
    activeEvents: activeEvents.count || 0,
    totalTeams: teams.count || 0,
    totalUsers: users.count || 0,
  })
}
