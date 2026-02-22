import { createClient, createAdminClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const eventId = searchParams.get('eventId')
  
  const adminClient = createAdminClient()
  
  if (!eventId) {
    return NextResponse.json([])
  }

  const { data, error } = await adminClient
    .from('evaluation_criteria')
    .select('*')
    .eq('event_id', eventId)
    .order('display_order', { ascending: true })

  if (error) {
    return NextResponse.json([])
  }

  return NextResponse.json(data || [])
}

export async function POST(request: Request) {
  try {
    const { eventId, criteria } = await request.json()
    
    if (!eventId) {
      return NextResponse.json({ error: 'Event ID required' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    // Insert new criteria
    const insertData = criteria.map((c: any, index: number) => ({
      event_id: eventId,
      criteria_name: c.criteria_name || c.name,
      max_score: c.max_score || c.maxPoints,
      display_order: index
    }))
    
    const { data, error } = await adminClient
      .from('evaluation_criteria')
      .insert(insertData)
      .select()

    if (error) {
      console.error('Insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Criteria save error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
