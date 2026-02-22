import { getCurrentUser } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MentorProfileForm from './profile-form'

export default async function ProfilePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  if (user.role !== 'mentor' && user.role !== 'admin') {
    redirect('/dashboard')
  }

  const supabase = await createClient()

  // Get mentor profile
  const { data: profile } = await supabase
    .from('mentor_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">Manage your professional details</p>
      </div>

      <MentorProfileForm user={user} profile={profile} />
    </div>
  )
}
