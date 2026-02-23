import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { team_id, judge_id, event_id } = await request.json()

    if (!team_id || !judge_id || !event_id) {
      return NextResponse.json({ error: 'Team, judge, and event are required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('team_judges')
      .insert({ team_id, judge_id, event_id })
      .select()
      .single()

    if (error) {
      console.error('Assignment error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Assignment error:', error)
    return NextResponse.json({ error: error.message || 'Failed to assign mentor' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    const { error } = await supabase
      .from('team_judges')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
