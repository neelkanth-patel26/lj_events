import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { eventId } = await request.json()
  const supabase = await createClient()

  // Get all teams for the event with their scores
  const { data: teams } = await supabase
    .from('teams')
    .select('id, team_name, school_name, event_id')
    .eq('event_id', eventId)

  if (!teams) return NextResponse.json({ error: 'No teams found' }, { status: 404 })

  // Calculate total scores for each team
  const rankings = await Promise.all(
    teams.map(async (team) => {
      const { data: scores } = await supabase
        .from('scores')
        .select('score')
        .eq('team_id', team.id)

      const totalScore = scores?.reduce((sum, s) => sum + Number(s.score), 0) || 0

      // Update team total_score
      await supabase
        .from('teams')
        .update({ total_score: totalScore })
        .eq('id', team.id)

      return {
        team_id: team.id,
        team_name: team.team_name,
        school_name: team.school_name,
        total_score: totalScore,
      }
    })
  )

  // Sort by score descending
  rankings.sort((a, b) => b.total_score - a.total_score)

  // Update leaderboard table
  await supabase.from('leaderboard').delete().eq('event_id', eventId)

  const leaderboardEntries = rankings.map((team, index) => ({
    event_id: eventId,
    team_id: team.team_id,
    rank: index + 1,
    total_score: team.total_score,
    team_name: team.team_name,
    school_name: team.school_name,
  }))

  await supabase.from('leaderboard').insert(leaderboardEntries)

  return NextResponse.json({ success: true, rankings })
}
