'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export async function signOut() {
  const cookieStore = await cookies()
  cookieStore.delete('user_session')
  redirect('/auth/login')
}

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const session = cookieStore.get('user_session')
  
  if (!session) return null

  try {
    const user = JSON.parse(session.value)
    const supabase = await createClient()
    
    const { data: userData } = await supabase
      .from('users')
      .select(`
        *,
        mentor_profiles (*)
      `)
      .eq('id', user.id)
      .single()

    if (!userData) return null

    const mentorProfile = userData?.mentor_profiles?.[0] || userData?.mentor_profiles

    return {
      id: userData.id,
      email: userData.email,
      role: userData.role,
      fullName: userData.full_name,
      mentorDetails: mentorProfile ? {
        company: mentorProfile.company,
        domain: mentorProfile.domain,
        experience: mentorProfile.experience,
        bankDetails: {
          bankName: mentorProfile.bank_name,
          accNo: mentorProfile.acc_no,
          ifsc: mentorProfile.ifsc,
          branch: mentorProfile.branch
        }
      } : null
    }
  } catch {
    return null
  }
}
