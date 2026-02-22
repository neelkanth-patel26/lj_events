import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'File required' }, { status: 400 })
    }

    const text = await file.text()
    const lines = text.trim().split('\n')
    const data = lines.slice(1).map(line => {
      const [email, name, password, department] = line.split(',')
      return { 
        email: email?.trim(), 
        name: name?.trim(), 
        password: password?.trim(), 
        department: department?.trim()
      }
    })

    const supabase = await createClient()
    let created = 0
    let updated = 0

    for (const row of data) {
      if (!row.email || !row.name) continue

      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', row.email)
        .single()

      if (existingUser) {
        await supabase
          .from('users')
          .update({
            full_name: row.name,
            department: row.department || null
          })
          .eq('id', existingUser.id)
        updated++
      } else {
        const { error } = await supabase.from('users').insert({
          email: row.email,
          full_name: row.name,
          password_hash: row.password,
          role: 'mentor',
          department: row.department || null
        })

        if (!error) created++
      }
    }

    return NextResponse.json({ 
      success: true, 
      mentors: created,
      updated,
      message: `Created ${created} new mentors, updated ${updated} existing mentors`
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
