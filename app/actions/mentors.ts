'use server'

import { createClient } from '@/lib/supabase/server'

export async function getMentors() {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('users')
        .select(`
      id,
      email,
      full_name,
      role,
      mentor_profiles (
        company,
        domain,
        experience,
        bank_name,
        acc_no,
        ifsc,
        branch
      )
    `)
        .eq('role', 'mentor')

    if (error || !data) {
        return []
    }

    return data.map(m => {
        const profile = Array.isArray(m.mentor_profiles) ? m.mentor_profiles[0] : m.mentor_profiles
        return {
            id: m.id,
            name: m.full_name,
            email: m.email,
            company: profile?.company || 'Unknown',
            domain: profile?.domain || 'General',
            banking: {
                bank: profile?.bank_name,
                acc: profile?.acc_no,
                ifsc: profile?.ifsc,
                branch: profile?.branch,
            }
        }
    })
}
