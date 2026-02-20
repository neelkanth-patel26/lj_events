import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get event data
    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Get teams count
    const { count: teamsCount } = await supabase
      .from('teams')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', id)

    // Get judges count
    const { count: judgesCount } = await supabase
      .from('team_judges')
      .select('judge_id', { count: 'exact', head: true })
      .eq('event_id', id)

    // Get submissions count
    const { count: submissionsCount } = await supabase
      .from('submissions')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', id)

    // Calculate completion rate
    const { data: completedJudgings } = await supabase
      .from('team_judges')
      .select('id')
      .eq('event_id', id)
      .eq('status', 'completed')

    const { data: totalJudgings } = await supabase
      .from('team_judges')
      .select('id')
      .eq('event_id', id)

    const completionRate = totalJudgings?.length > 0 
      ? Math.round((completedJudgings?.length || 0) / totalJudgings.length * 100)
      : 0

    // Combine event data with statistics
    const eventWithStats = {
      ...event,
      total_teams: teamsCount || 0,
      total_judges: judgesCount || 0,
      total_submissions: submissionsCount || 0,
      completion_rate: completionRate
    }

    return NextResponse.json(eventWithStats, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error: any) {
    console.error('Error fetching event:', error)
    return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 })
  }
}