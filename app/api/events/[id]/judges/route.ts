import { getCurrentUser } from '@/app/actions/auth'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: judges, error } = await supabase
      .from('team_judges')
      .select(`
        id,
        status,
        created_at,
        updated_at,
        users:judge_id (
          id,
          full_name,
          email
        ),
        teams (
          id,
          team_name,
          event_id
        )
      `)
      .eq('teams.event_id', params.id)

    if (error) throw error

    // Group judges by judge_id to avoid duplicates
    const uniqueJudges = judges?.reduce((acc: any[], current: any) => {
      const existingJudge = acc.find(j => j.judge_id === current.users?.id)
      if (!existingJudge) {
        acc.push({
          judge_id: current.users?.id,
          name: current.users?.full_name,
          email: current.users?.email,
          teams_assigned: 1,
          status: current.status
        })
      } else {
        existingJudge.teams_assigned += 1
      }
      return acc
    }, []) || []

    return NextResponse.json(uniqueJudges)
  } catch (error: any) {
    console.error('[API] Error fetching event judges:', error.message || error)
    return NextResponse.json(
      { error: 'Failed to fetch judges', details: error.message || error },
      { status: 500 }
    )
  }
}
