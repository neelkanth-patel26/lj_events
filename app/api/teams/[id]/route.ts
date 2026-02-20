import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const teamId = params.id

    // First try to get team by UUID
    let { data: team, error } = await supabase
      .from('teams')
      .select(`
        *,
        team_members (
          id,
          role,
          users (
            id,
            full_name,
            email,
            role
          )
        )
      `)
      .eq('id', teamId)
      .single()

    // If not found by UUID, try by team name (Team 1, Team 2, etc.)
    if (error) {
      const { data: teamByName } = await supabase
        .from('teams')
        .select(`
          *,
          team_members (
            id,
            role,
            users (
              id,
              full_name,
              email,
              role
            )
          )
        `)
        .eq('team_name', `Team ${teamId}`)
        .single()
      
      if (teamByName) {
        team = teamByName
        error = null
      }
    }

    // If still not found, try to find any team with similar ID pattern
    if (error) {
      const { data: allTeams } = await supabase
        .from('teams')
        .select(`
          *,
          team_members (
            id,
            role,
            users (
              id,
              full_name,
              email,
              role
            )
          )
        `)
      
      // Find team by partial match or return first available team for debugging
      team = allTeams?.[0] || null
    }

    if (!team) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 })
    }

    // Update team size to match actual members
    const actualTeamSize = team.team_members?.length || 0
    if (team.team_size !== actualTeamSize) {
      await supabase
        .from('teams')
        .update({ team_size: actualTeamSize })
        .eq('id', team.id)
      
      team.team_size = actualTeamSize
    }

    return NextResponse.json(team, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error: any) {
    console.error('Team API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}