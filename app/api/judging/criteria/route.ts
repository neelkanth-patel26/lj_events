import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json([])
  }

  const { data, error } = await supabase
    .from('judging_criteria')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json([])
  }

  return NextResponse.json(data || [])
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { criteria } = await request.json()

  await supabase.from('judging_criteria').delete().eq('user_id', user.id)

  const { data, error } = await supabase
    .from('judging_criteria')
    .insert(criteria.map((c: any) => ({
      user_id: user.id,
      name: c.name,
      max_points: c.maxPoints
    })))
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}
