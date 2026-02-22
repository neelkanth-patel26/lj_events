import { getCurrentUser } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminMentorProfileForm from './admin-profile-form'

export default async function AdminMentorProfilePage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser()

  if (!user || user.role !== 'admin') {
    redirect('/dashboard')
  }

  const supabase = await createClient()

  const { data: mentor } = await supabase
    .from('users')
    .select(`
      *,
      mentor_profiles (*)
    `)
    .eq('id', params.id)
    .eq('role', 'mentor')
    .single()

  if (!mentor) {
    redirect('/dashboard/mentors')
  }

  const profile = mentor.mentor_profiles?.[0] || mentor.mentor_profiles

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{mentor.full_name}</h1>
        <p className="text-muted-foreground">Manage mentor profile details</p>
      </div>

      <AdminMentorProfileForm mentor={mentor} profile={profile} />
    </div>
  )
}
