import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { full_name, email, password, enrollment_number, role, department } = body

    const supabase = await createClient()
    const passwordHash = Buffer.from(password).toString('base64')

    const { data, error } = await supabase
      .from('users')
      .insert({
        full_name,
        email,
        password_hash: passwordHash,
        enrollment_number: enrollment_number || null,
        role: role || 'student',
        department: department || null
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, user: data })
  } catch (error: any) {
    console.error('Error adding student:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
