import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('evaluation_criteria')
      .select('*')
      .eq('event_id', id)
      .order('created_at', { ascending: true })
    
    if (error) {
      console.error('Error fetching criteria:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data || [], {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error: any) {
    console.error('Error in GET /api/events/[id]/criteria:', error)
    return NextResponse.json({ error: 'Failed to fetch criteria' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { criteriaName, description, maxScore, weight } = await request.json()
    
    const { data, error } = await supabase
      .from('evaluation_criteria')
      .insert({
        event_id: id,
        criteria_name: criteriaName,
        description,
        max_score: parseInt(maxScore),
        weight: parseFloat(weight),
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating criteria:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error: any) {
    console.error('Error in POST /api/events/[id]/criteria:', error)
    return NextResponse.json({ error: 'Failed to create criteria' }, { status: 500 })
  }
}
