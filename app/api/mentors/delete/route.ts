import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Delete mentor profile first (due to foreign key)
    await adminClient
      .from('mentor_profiles')
      .delete()
      .eq('user_id', userId)

    // Delete user
    const { error } = await adminClient
      .from('users')
      .delete()
      .eq('id', userId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Delete error:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete mentor' }, { status: 500 })
  }
}
