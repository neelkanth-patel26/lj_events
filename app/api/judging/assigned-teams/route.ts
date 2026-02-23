import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const judgeId = searchParams.get('judgeId')
    const eventId = searchParams.get('eventId')

    if (!judgeId) {
      return NextResponse.json({ error: 'Judge ID is required' }, { status: 400 })
    }

    const supabase = await createClient()

    let query = supabase
      .from('team_judges')
      .select('teams(*)')
      .eq('judge_id', judgeId)

    if (eventId) {
      query = query.eq('event_id', eventId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching assigned teams:', error)
      throw error
    }

    // Extract teams from the nested structure
    const teams = data?.map(item => item.teams).filter(Boolean) || []

    return NextResponse.json(teams)
  } catch (error: any) {
    console.error('API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
