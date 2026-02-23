import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const userSession = cookieStore.get('user_session')
    
    if (!userSession) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    const user = JSON.parse(userSession.value)
    
    // Fetch latest user data including theme
    const supabase = await createClient()
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (userData) {
      return NextResponse.json({
        ...user,
        theme: userData.theme || 'light',
        fullName: userData.full_name,
        enrollment_number: userData.enrollment_number
      })
    }
    
    return NextResponse.json(user)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
