import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createClient()

    const { data: members, error } = await supabase
      .from('users')
      .select('id, name, email, enrollment_number')
      .eq('team_id', id)

    if (error) throw error

    return NextResponse.json(members || [])
  } catch (error: any) {
    console.error('Error fetching team members:', error)
    return NextResponse.json([], { status: 200 })
  }
}
