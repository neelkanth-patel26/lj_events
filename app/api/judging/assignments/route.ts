import { getCurrentUser } from '@/app/actions/auth'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const user = await getCurrentUser()

    if (!user || user.role !== 'mentor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get teams assigned to this mentor/judge
    const { data: assignments, error: assignError } = await supabase
      .from('team_judges')
      .select(
        `
        team_id,
        teams:team_id(
          id,
          team_name,
          school_name,
          event_id,
          total_score
        )
      `
      )
      .eq('judge_id', user.id)

    if (assignError) throw assignError

    // Get evaluation criteria for each team's event
    const enrichedTeams = await Promise.all(
      (assignments || []).map(async (assignment: any) => {
        const team = assignment.teams[0]
        if (!team) return null

        const { data: criteria, error: critError } = await supabase
          .from('evaluation_criteria')
          .select('*')
          .eq('event_id', team.event_id)
          .order('display_order', { ascending: true })

        if (critError) throw critError

        // Get existing scores from this judge
        const { data: scores, error: scoresError } = await supabase
          .from('scores')
          .select('criteria_id, score, feedback')
          .eq('team_id', team.id)
          .eq('judge_id', user.id)

        if (scoresError) throw scoresError

        return {
          ...team,
          criteria: criteria || [],
          scores: scores || [],
        }
      })
    )

    return NextResponse.json(enrichedTeams.filter(Boolean))
  } catch (error) {
    console.error('[v0] Error fetching judging assignments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    )
  }
}
