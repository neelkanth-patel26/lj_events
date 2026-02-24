import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

export const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  }
})

// Helper function to create admin user with role
export async function createAdminUser(
  email: string,
  password: string,
  fullName: string,
  role: 'admin' | 'mentor' | 'student'
) {
  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role: role,
    },
  })

  if (error) throw error

  // Insert into users table
  if (data.user) {
    const { error: insertError } = await adminClient
      .from('users')
      .insert({
        id: data.user.id,
        email,
        full_name: fullName,
        role: role,
      })

    if (insertError) throw insertError
  }

  return data
}

// Helper function to get user role
export async function getUserRole(userId: string) {
  const { data, error } = await adminClient
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()

  if (error) throw error
  return data?.role
}
