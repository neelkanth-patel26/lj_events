import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const { id: teamId } = await params

    const { data, error } = await supabase
      .from('team_judges')
      .select('id, team_id, judge_id, judge:judge_id(full_name)')
      .eq('team_id', teamId)

    if (error) {
      console.error('Fetch judges error:', error)
      throw error
    }

    return NextResponse.json(data || [])
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
