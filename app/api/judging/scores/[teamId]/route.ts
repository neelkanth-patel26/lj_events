import { createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params
    const { searchParams } = new URL(request.url)
    const judgeId = searchParams.get('judgeId')

    if (!judgeId) {
      return NextResponse.json(
        { error: 'Judge ID is required' },
        { status: 400 }
      )
    }

    const adminClient = createAdminClient()

    const { data: scores, error } = await adminClient
      .from('scores')
      .select('*')
      .eq('team_id', teamId)
      .eq('judge_id', judgeId)

    if (error) {
      throw error
    }

    return NextResponse.json(scores || [])
  } catch (error: any) {
    console.error('Error fetching scores:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch scores' },
      { status: 500 }
    )
  }
}
