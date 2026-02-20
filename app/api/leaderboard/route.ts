import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')

    const supabase = await createClient()

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }

    const { data: teams, error: teamError } = await supabase
      .from('teams')
      .select('id, team_name, school_name, domain, stall_no, total_score, team_size')
      .eq('event_id', eventId)
      .order('total_score', { ascending: false, nullsLast: true })

    if (teamError) throw teamError

    const teamsWithScores = teams.map((team: any) => ({
      ...team,
      total_score: team.total_score || 0
    }))

    teamsWithScores.sort((a, b) => (b.total_score || 0) - (a.total_score || 0))

    const leaderboard = teamsWithScores.map((team: any, index: number) => ({
      ...team,
      rank: index + 1,
    }))

    return NextResponse.json(leaderboard, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    )
  }
}
