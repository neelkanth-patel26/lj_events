import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { students, eventId } = await request.json()
  const supabase = await createClient()

  const groupedStudents = students.reduce((acc: any, student: any) => {
    const groupNum = student.groupNumber || 'ungrouped'
    if (!acc[groupNum]) acc[groupNum] = []
    acc[groupNum].push(student)
    return acc
  }, {})

  const createdUsers: any[] = []

  for (const student of students) {
    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email: student.email,
        full_name: student.fullName,
        password_hash: Buffer.from(student.password).toString('base64'),
        role: 'student',
      })
      .select('id')
      .single()

    if (user) {
      createdUsers.push({ ...user, groupNumber: student.groupNumber, schoolName: student.schoolName })
    }
  }

  for (const [groupNum, members] of Object.entries(groupedStudents)) {
    if (groupNum === 'ungrouped' || !groupNum) continue

    const schoolName = (members as any[])[0]?.schoolName || 'Unknown School'
    const newMembersForGroup = createdUsers.filter(u => u.groupNumber === groupNum)
    
    if (newMembersForGroup.length === 0) continue

    const { data: existingTeam } = await supabase
      .from('teams')
      .select('id, team_size')
      .eq('event_id', eventId)
      .eq('team_name', `Team ${groupNum}`)
      .maybeSingle()

    let teamId = existingTeam?.id

    if (!existingTeam) {
      const { data: team } = await supabase
        .from('teams')
        .insert({
          event_id: eventId,
          team_name: `Team ${groupNum}`,
          school_name: schoolName,
          team_size: 0,
        })
        .select('id')
        .single()
      
      if (team) teamId = team.id
    }

    if (teamId) {
      const teamMembers = newMembersForGroup.map(u => ({
        team_id: teamId,
        user_id: u.id,
        role: 'member',
      }))

      await supabase.from('team_members').insert(teamMembers)

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

  return NextResponse.json({ success: true, count: createdUsers.length })
}
