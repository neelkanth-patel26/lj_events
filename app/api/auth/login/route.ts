import { createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createAdminClient()
    
    // First, get user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    console.log('User lookup:', { email, found: !!user, error: userError?.message, details: userError })

    if (userError || !user) {
      console.error('Database error:', userError)
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Check password
    const passwordHash = Buffer.from(password).toString('base64')
    if (user.password_hash !== passwordHash) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const cookieStore = await cookies()
    cookieStore.set('user_session', JSON.stringify({ id: user.id, email: user.email, role: user.role }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
    })

    return NextResponse.json({ user })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
