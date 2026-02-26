import { adminClient } from '@/lib/supabase/admin'
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
      const [email, name, password, department, company, designation, domain, experience, bank_name, acc_no, ifsc, branch] = line.split(',')
      return { 
        email: email?.trim(), 
        name: name?.trim(), 
        password: password?.trim(), 
        department: department?.trim(),
        company: company?.trim(),
        designation: designation?.trim(),
        domain: domain?.trim(),
        experience: experience?.trim(),
        bank_name: bank_name?.trim(),
        acc_no: acc_no?.trim(),
        ifsc: ifsc?.trim(),
        branch: branch?.trim()
      }
    })

    let created = 0
    let updated = 0

    for (const row of data) {
      if (!row.email || !row.name) continue

      const { data: existingUser } = await adminClient
        .from('users')
        .select('id')
        .eq('email', row.email)
        .single()

      if (existingUser) {
        await adminClient
          .from('users')
          .update({
            full_name: row.name,
            department: row.department || null
          })
          .eq('id', existingUser.id)

        const { data: existingProfile } = await adminClient
          .from('mentor_profiles')
          .select('user_id')
          .eq('user_id', existingUser.id)
          .single()

        if (existingProfile) {
          await adminClient
            .from('mentor_profiles')
            .update({
              company: row.company || null,
              designation: row.designation || null,
              domain: row.domain || null,
              experience: row.experience || null,
              bank_name: row.bank_name || null,
              acc_no: row.acc_no || null,
              ifsc: row.ifsc || null,
              branch: row.branch || null,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', existingUser.id)
        } else {
          await adminClient
            .from('mentor_profiles')
            .insert({
              user_id: existingUser.id,
              company: row.company || null,
              designation: row.designation || null,
              domain: row.domain || null,
              experience: row.experience || null,
              bank_name: row.bank_name || null,
              acc_no: row.acc_no || null,
              ifsc: row.ifsc || null,
              branch: row.branch || null
            })
        }
        updated++
      } else {
        const passwordHash = Buffer.from(row.password).toString('base64')
        const { data: newUser, error } = await adminClient.from('users').insert({
          email: row.email,
          full_name: row.name,
          password_hash: passwordHash,
          role: 'mentor',
          department: row.department || null
        }).select('id').single()

        if (!error && newUser) {
          await adminClient
            .from('mentor_profiles')
            .insert({
              user_id: newUser.id,
              company: row.company || null,
              designation: row.designation || null,
              domain: row.domain || null,
              experience: row.experience || null,
              bank_name: row.bank_name || null,
              acc_no: row.acc_no || null,
              ifsc: row.ifsc || null,
              branch: row.branch || null
            })
        }

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
