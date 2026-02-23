import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminClient } from '@/lib/supabase/admin'

export async function PUT(request: Request) {
  try {
    const cookieStore = await cookies()
    const userSession = cookieStore.get('user_session')
    
    if (!userSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const user = JSON.parse(userSession.value)
    const body = await request.json()
    const { full_name, theme, mentorProfile } = body

    const updates: any = {}
    if (full_name !== undefined) updates.full_name = full_name
    if (theme !== undefined) updates.theme = theme
    if (Object.keys(updates).length > 0) updates.updated_at = new Date().toISOString()

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (mentorProfile && user.role === 'mentor') {
      const { data: existing } = await adminClient
        .from('mentor_profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .single()

      if (existing) {
        await adminClient
          .from('mentor_profiles')
          .update({
            company: mentorProfile.company || null,
            domain: mentorProfile.domain || null,
            experience: mentorProfile.experience || null,
            designation: mentorProfile.designation || null,
            bank_name: mentorProfile.bank_name || null,
            acc_no: mentorProfile.acc_no || null,
            ifsc: mentorProfile.ifsc || null,
            branch: mentorProfile.branch || null,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
      } else {
        await adminClient
          .from('mentor_profiles')
          .insert({
            user_id: user.id,
            company: mentorProfile.company || null,
            domain: mentorProfile.domain || null,
            experience: mentorProfile.experience || null,
            designation: mentorProfile.designation || null,
            bank_name: mentorProfile.bank_name || null,
            acc_no: mentorProfile.acc_no || null,
            ifsc: mentorProfile.ifsc || null,
            branch: mentorProfile.branch || null,
          })
      }
    }

    return NextResponse.json({ user: data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}