import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const userSession = cookieStore.get('user_session')
    
    if (!userSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const user = JSON.parse(userSession.value)

    const { data, error } = await adminClient
      .from('mentor_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return NextResponse.json(data || {})
  } catch (error: any) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ error: error.message || 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, company, domain, experience, designation, bank_name, acc_no, ifsc, branch } = body

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const { data: existing } = await adminClient
      .from('mentor_profiles')
      .select('user_id')
      .eq('user_id', userId)
      .single()

    if (existing) {
      const { error } = await adminClient
        .from('mentor_profiles')
        .update({
          company: company || null,
          domain: domain || null,
          experience: experience || null,
          designation: designation || null,
          bank_name: bank_name || null,
          acc_no: acc_no || null,
          ifsc: ifsc || null,
          branch: branch || null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)

      if (error) {
        console.error('Update error:', error)
        throw error
      }
    } else {
      const { error } = await adminClient
        .from('mentor_profiles')
        .insert({
          user_id: userId,
          company: company || null,
          domain: domain || null,
          experience: experience || null,
          designation: designation || null,
          bank_name: bank_name || null,
          acc_no: acc_no || null,
          ifsc: ifsc || null,
          branch: branch || null,
        })

      if (error) {
        console.error('Insert error:', error)
        throw error
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: error.message || 'Failed to update profile' }, { status: 500 })
  }
}
