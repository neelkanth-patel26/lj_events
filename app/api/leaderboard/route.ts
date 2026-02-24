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

    // Get current user role from session
    const { data: { user } } = await supabase.auth.getUser()
    const { data: userData } = user ? await supabase
      .from('users')
      .select('role')
      .eq('email', user.email)
      .single() : { data: null }

    // Check if leaderboard is visible
    const { data: event } = await supabase
      .from('events')
      .select('leaderboard_visible')
      .eq('id', eventId)
      .single()

    // Only restrict students when leaderboard is not visible
    if (!event?.leaderboard_visible && userData?.role === 'student') {
      return NextResponse.json(
        { error: 'Leaderboard is not visible for this event' },
        { status: 403 }
      )
    }

    const { data: teams, error: teamError } = await supabase
      .from('teams')
      .select('id, team_name, school_name, domain, stall_no, total_score, team_size')
      .eq('event_id', eventId)
      .order('total_score', { ascending: false, nullsLast: true })

    if (teamError) throw teamError

    // Fetch criterion-wise scores for each team
    const teamsWithMembers = await Promise.all(
      teams.map(async (team: any) => {
        const { data: members } = await supabase
          .from('team_members')
          .select('users:user_id(full_name)')
          .eq('team_id', team.id)
        
        // Get criterion-wise total scores
        const { data: scores } = await supabase
          .from('scores')
          .select(`
            score,
            evaluation_criteria:criteria_id(
              id,
              criteria_name
            )
          `)
          .eq('team_id', team.id)
        
        // Group scores by criterion
        const criterionScores: Record<string, { name: string; total: number }> = {}
        scores?.forEach((s: any) => {
          const criterionId = s.evaluation_criteria?.id
          const criterionName = s.evaluation_criteria?.criteria_name
          if (criterionId && criterionName) {
            if (!criterionScores[criterionId]) {
              criterionScores[criterionId] = { name: criterionName, total: 0 }
            }
            criterionScores[criterionId].total += s.score || 0
          }
        })
        
        return {
          ...team,
          members: members?.map(m => ({ full_name: m.users?.full_name })) || [],
          criterionScores: Object.values(criterionScores)
        }
      })
    )

    const teamsWithScores = teamsWithMembers.map((team: any) => ({
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
