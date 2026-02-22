import { createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = createAdminClient()

    const { data: members, error } = await supabase
      .from('team_members')
      .select(`
        id,
        role,
        users:user_id (
          id,
          full_name,
          email,
          enrollment_number
        )
      `)
      .eq('team_id', id)

    if (error) throw error

    return NextResponse.json(members || [])
  } catch (error: any) {
    console.error('Error fetching team members:', error)
    return NextResponse.json([], { status: 200 })
  }
}
