import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get event leaderboard visibility
    const { data: event } = await supabase
      .from('events')
      .select('leaderboard_visible')
      .eq('id', id)
      .single()

    // Get teams with member counts via team_members
    const { data: teams, error } = await supabase
      .from('teams')
      .select(`
        *,
        team_members(count)
      `)
      .eq('event_id', id)

    if (error) throw error

    // Process teams data to include member counts
    const processedTeams = (teams || []).map(team => ({
      ...team,
      member_count: team.team_members?.[0]?.count || 0
    }))

    return NextResponse.json({ teams: processedTeams, leaderboard_visible: event?.leaderboard_visible || false }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error: any) {
    console.error('Error fetching teams:', error)
    return NextResponse.json({ error: 'Failed to fetch teams' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { teamName, schoolName } = body
    
    const supabase = await createClient()

    const { data: team, error } = await supabase
      .from('teams')
      .insert({
        team_name: teamName,
        school_name: schoolName,
        event_id: id
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(team, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error: any) {
    console.error('Error creating team:', error)
    return NextResponse.json({ error: 'Failed to create team' }, { status: 500 })
  }
}