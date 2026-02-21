import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { teamId, scores } = await request.json()

    console.log('Submitting scores for team:', teamId, 'Scores:', scores)

    if (!teamId || !Array.isArray(scores)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    // Calculate total score
    const totalScore = scores.reduce((sum, s) => sum + (s.score || 0), 0)

    console.log('Calculated total score:', totalScore)

    // Use admin client to bypass RLS
    const adminClient = createAdminClient()
    const { error: updateError } = await adminClient
      .from('teams')
      .update({ total_score: totalScore })
      .eq('id', teamId)

    if (updateError) {
      console.error('Update error:', updateError)
      throw updateError
    }

    console.log('Score updated successfully')

    return NextResponse.json({ success: true, totalScore })
  } catch (error: any) {
    console.error('Error submitting scores:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to submit scores' },
      { status: 500 }
    )
  }
}
