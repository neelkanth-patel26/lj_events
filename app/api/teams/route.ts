import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('event')
    
    let query = supabase.from('teams').select('*').order('created_at', { ascending: false })
    
    if (eventId) {
      query = query.eq('event_id', eventId)
    }

    const { data: teams, error } = await query

    if (error) throw error

    return NextResponse.json(teams || [], {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 })
  }
}