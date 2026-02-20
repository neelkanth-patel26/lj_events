import { getCurrentUser } from '@/app/actions/auth'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let query = supabase
      .from('submissions')
      .select('*')
      .order('submitted_at', { ascending: false })

    if (user.role === 'student') {
      // Get student's team and their submissions
      const { data: teamData } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id)

      const teamIds = teamData?.map((t) => t.team_id) || []
      if (teamIds.length > 0) {
        query = query.in('team_id', teamIds)
      } else {
        return NextResponse.json([])
      }
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('[v0] Error fetching submissions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const user = await getCurrentUser()

    if (!user || user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { submissionTitle, submissionDescription, submissionUrl } =
      await request.json()

    if (!submissionTitle) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get student's team
    const { data: teamData, error: teamError } = await supabase
      .from('team_members')
      .select('team_id, team:team_id(event_id)')
      .eq('user_id', user.id)
      .single()

    if (teamError || !teamData) {
      return NextResponse.json(
        { error: 'Not part of a team' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('submissions')
      .insert({
        team_id: teamData.team_id,
        event_id: teamData.team.event_id,
        submission_title: submissionTitle,
        submission_description: submissionDescription,
        submission_url: submissionUrl,
        status: 'submitted',
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('[v0] Error creating submission:', error)
    return NextResponse.json(
      { error: 'Failed to create submission' },
      { status: 500 }
    )
  }
}
