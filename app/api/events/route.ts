import { getCurrentUser } from '@/app/actions/auth'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: events, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(events || [], {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error: any) {
    console.error('[API] Error fetching events:', error.message || error)
    return NextResponse.json({ error: 'Failed to fetch events', details: error.message || error }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, description, eventDate, startTime, endTime, venue, maxTeams, registrationDeadline, status } = await request.json()

    if (!name || !eventDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('events')
      .insert({
        name,
        description,
        event_date: eventDate,
        start_time: startTime,
        end_time: endTime,
        venue,
        max_teams: maxTeams,
        registration_deadline: registrationDeadline,
        created_by: user.id,
        status: status || 'draft',
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    console.error('[API] Error creating event:', error.message || error)
    return NextResponse.json(
      { error: 'Failed to create event', details: error.message || error },
      { status: 500 }
    )
  }
}
