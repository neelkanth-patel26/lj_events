import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: mentors, error } = await supabase
      .from('users')
      .select('id, full_name, email')
      .eq('role', 'mentor')
      .order('full_name', { ascending: true })

    if (error) throw error

    return NextResponse.json(mentors || [])
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
