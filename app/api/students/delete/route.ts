import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('id')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Delete team_members first
    await supabase.from('team_members').delete().eq('user_id', userId)

    // Delete scores
    await supabase.from('scores').delete().eq('judge_id', userId)

    // Delete the user
    const { error } = await supabase.from('users').delete().eq('id', userId)

    if (error) throw error

    return NextResponse.json({ message: 'Student deleted successfully' })
  } catch (error: any) {
    console.error('Error deleting student:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
