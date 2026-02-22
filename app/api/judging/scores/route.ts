import { createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { teamId, scores, judgeId } = await request.json()

    console.log('Received data:', { teamId, scores, judgeId })

    if (!teamId || !Array.isArray(scores)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    if (!judgeId) {
      return NextResponse.json(
        { error: 'Judge ID is required' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    // Delete existing scores for this team and judge
    const { error: deleteError } = await adminClient
      .from('scores')
      .delete()
      .eq('team_id', teamId)
      .eq('judge_id', judgeId)

    console.log('Delete result:', deleteError)

    // Insert new scores
    for (const scoreData of scores) {
      const { error: insertError } = await adminClient
        .from('scores')
        .insert({
          team_id: teamId,
          judge_id: judgeId,
          criteria_id: scoreData.criteriaId,
          score: scoreData.score || 0
        })
      
      console.log('Insert result:', { scoreData, insertError })
      
      if (insertError) {
        throw insertError
      }
    }

    // Calculate total score from all judges
    const { data: allScores } = await adminClient
      .from('scores')
      .select('score')
      .eq('team_id', teamId)

    const totalScore = allScores?.reduce((sum, s) => sum + (s.score || 0), 0) || 0

    console.log('Total score calculated:', totalScore)

    // Update team total score
    const { error: updateError } = await adminClient
      .from('teams')
      .update({ total_score: totalScore })
      .eq('id', teamId)

    console.log('Update team result:', updateError)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ success: true, totalScore })
  } catch (error: any) {
    console.error('Error submitting scores:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to submit scores' },
      { status: 500 }
    )
  }
}
