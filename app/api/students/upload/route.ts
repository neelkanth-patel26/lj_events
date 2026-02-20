import { getCurrentUser } from '@/app/actions/auth'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const eventId = formData.get('eventId') as string

    if (!file || !eventId) {
      return NextResponse.json({ error: 'File and event required' }, { status: 400 })
    }

    const text = await file.text()
    const lines = text.trim().split('\n')
    const data = lines.slice(1).map(line => {
      const [email, name, password, group, school, domain, stall] = line.split(',')
      return { email: email?.trim(), name: name?.trim(), password: password?.trim(), group: group?.trim(), school: school?.trim(), domain: domain?.trim(), stall: stall?.trim() }
    })

    const supabase = await createClient()
    const results = { users: 0, teams: 0 }
    const teamMap = new Map()

    for (const row of data) {
      if (!row.email || !row.name) continue

      const { data: user } = await supabase.from('users').insert({
        email: row.email,
        full_name: row.name,
        password_hash: row.password,
        role: 'student'
      }).select().single()

      if (user) {
        results.users++
        if (row.group) {
          if (!teamMap.has(row.group)) {
            teamMap.set(row.group, { members: [], school: row.school, domain: row.domain, stall: row.stall })
          }
          teamMap.get(row.group).members.push(user)
        }
      }
    }

    for (const [groupNum, teamData] of teamMap) {
      const { data: team } = await supabase.from('teams').insert({
        event_id: eventId,
        team_name: `Team ${groupNum}`,
        school_name: teamData.school,
        domain: teamData.domain,
        stall_no: teamData.stall,
        team_size: teamData.members.length
      }).select().single()

      if (team) {
        results.teams++
        for (const member of teamData.members) {
          await supabase.from('team_members').insert({
            team_id: team.id,
            user_id: member.id,
            role: 'member'
          })
        }
      }
    }

    return NextResponse.json({ success: true, ...results })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}