import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Get teams with member counts
    const { data: teams, error } = await supabase
      .from('teams')
      .select(`
        *,
        users!inner(count)
      `)
      .eq('event_id', id)

    if (error) {
      console.error('Error fetching teams:', error)
      // Fallback to basic team data if join fails
      const { data: basicTeams, error: basicError } = await supabase
        .from('teams')
        .select('*')
        .eq('event_id', id)
      
      if (basicError) throw basicError
      
      // Get member counts separately
      const teamsWithCounts = await Promise.all(
        (basicTeams || []).map(async (team) => {
          const { count } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('team_id', team.id)
          
          return {
            ...team,
            member_count: count || 0
          }
        })
      )
      
      return NextResponse.json(teamsWithCounts, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      })
    }

    // Process teams data to include member counts
    const processedTeams = (teams || []).map(team => ({
      ...team,
      member_count: team.users?.length || 0
    }))

    return NextResponse.json(processedTeams, {
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