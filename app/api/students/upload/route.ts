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
      const [email, name, password, group, school, domain, stall, enrollment, department] = line.split(',')
      return { 
        email: email?.trim(), 
        name: name?.trim(), 
        password: password?.trim(), 
        group: group?.trim(), 
        school: school?.trim(), 
        domain: domain?.trim(), 
        stall: stall?.trim(),
        enrollment: enrollment?.trim(),
        department: department?.trim()
      }
    })

    const supabase = await createClient()
    const results = { users: 0, teams: 0, skipped: 0, updated: 0 }
    const teamMap = new Map()

    for (const row of data) {
      if (!row.email || !row.name) continue

      // Check if user exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', row.email)
        .single()

      let userId = existingUser?.id

      if (existingUser) {
        // Update existing user including password
        const passwordHash = row.password ? Buffer.from(row.password).toString('base64') : null
        await supabase
          .from('users')
          .update({
            full_name: row.name,
            password_hash: passwordHash,
            enrollment_number: row.enrollment,
            department: row.department || null
          })
          .eq('id', existingUser.id)
        results.updated++
        userId = existingUser.id
      } else {
        // Create new user with encoded password
        const passwordHash = row.password ? Buffer.from(row.password).toString('base64') : null
        const { data: user } = await supabase.from('users').insert({
          email: row.email,
          full_name: row.name,
          password_hash: passwordHash,
          role: 'student',
          enrollment_number: row.enrollment,
          department: row.department || null
        }).select().single()

        if (user) {
          results.users++
          userId = user.id
        }
      }

      // Handle team assignment
      if (userId && row.group) {
        if (!teamMap.has(row.group)) {
          teamMap.set(row.group, { members: [], school: row.school, domain: row.domain, stall: row.stall })
        }
        teamMap.get(row.group).members.push(userId)
      }
    }

    // Create or update teams
    for (const [groupNum, teamData] of teamMap) {
      const { data: existingTeam } = await supabase
        .from('teams')
        .select('id, team_size')
        .eq('event_id', eventId)
        .eq('team_name', `Team ${groupNum}`)
        .maybeSingle()

      let teamId = existingTeam?.id
      let newMembersAdded = 0

      if (existingTeam) {
        teamId = existingTeam.id
      } else {
        const { data: team } = await supabase.from('teams').insert({
          event_id: eventId,
          team_name: `Team ${groupNum}`,
          school_name: teamData.school,
          domain: teamData.domain,
          stall_no: teamData.stall,
          team_size: 0
        }).select('id').single()

        if (team) {
          results.teams++
          teamId = team.id
        }
      }

      if (teamId) {
        for (const memberId of teamData.members) {
          const { data: existing } = await supabase
            .from('team_members')
            .select('id')
            .eq('team_id', teamId)
            .eq('user_id', memberId)
            .maybeSingle()

          if (!existing) {
            await supabase.from('team_members').insert({
              team_id: teamId,
              user_id: memberId,
              role: 'member'
            })
            newMembersAdded++
          }
        }

        // Update team size based on actual member count
        const { count } = await supabase
          .from('team_members')
          .select('*', { count: 'exact', head: true })
          .eq('team_id', teamId)

        await supabase
          .from('teams')
          .update({ team_size: count || 0 })
          .eq('id', teamId)
      }
    }

    return NextResponse.json({ 
      success: true, 
      users: results.users,
      teams: results.teams,
      updated: results.updated,
      message: `Created ${results.users} new users, updated ${results.updated} existing users, created ${results.teams} teams`
    })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}