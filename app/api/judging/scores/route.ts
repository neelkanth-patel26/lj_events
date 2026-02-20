import { getCurrentUser } from '@/app/actions/auth'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const user = await getCurrentUser()

    if (!user || user.role !== 'mentor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { teamId, scores } = await request.json()

    if (!teamId || !Array.isArray(scores)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    // Verify the judge is assigned to this team
    const { data: assignment, error: assignError } = await supabase
      .from('team_judges')
      .select('*')
      .eq('team_id', teamId)
      .eq('judge_id', user.id)
      .single()

    if (assignError || !assignment) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Insert or update scores
    const scoreRecords = scores.map((s: any) => ({
      team_id: teamId,
      judge_id: user.id,
      criteria_id: s.criteriaId,
      score: s.score,
      feedback: s.feedback || null,
    }))

    const { error: insertError } = await supabase
      .from('scores')
      .upsert(scoreRecords, {
        onConflict: 'team_id,judge_id,criteria_id',
      })

    if (insertError) throw insertError

    // Calculate total score for the team
    const { data: allScores, error: totalError } = await supabase
      .from('scores')
      .select('score, criteria:criteria_id(weight)')
      .eq('team_id', teamId)

    if (totalError) throw totalError

    // Update team's total score
    const totalScore =
      allScores?.reduce((sum: number, record: any) => {
        const weight = record.criteria?.weight || 1
        return sum + record.score * weight
      }, 0) / allScores.length || 0

    const { error: updateError } = await supabase
      .from('teams')
      .update({ total_score: totalScore })
      .eq('id', teamId)

    if (updateError) throw updateError

    // Update judge status
    const { error: statusError } = await supabase
      .from('team_judges')
      .update({ status: 'completed' })
      .eq('team_id', teamId)
      .eq('judge_id', user.id)

    if (statusError) throw statusError

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[v0] Error submitting scores:', error)
    return NextResponse.json(
      { error: 'Failed to submit scores' },
      { status: 500 }
    )
  }
}
