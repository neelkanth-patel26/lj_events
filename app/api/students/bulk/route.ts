import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { students, eventId } = await request.json()
  const supabase = await createClient()

  // Group students by group number
  const groupedStudents = students.reduce((acc: any, student: any) => {
    const groupNum = student.groupNumber || 'ungrouped'
    if (!acc[groupNum]) acc[groupNum] = []
    acc[groupNum].push(student)
    return acc
  }, {})

  const createdUsers: any[] = []

  // Create users first
  for (const student of students) {
    const { data: user } = await supabase
      .from('users')
      .insert({
        email: student.email,
        full_name: student.fullName,
        password_hash: Buffer.from(student.password).toString('base64'),
        role: 'student',
      })
      .select()
      .single()

    if (user) {
      createdUsers.push({ ...user, groupNumber: student.groupNumber, schoolName: student.schoolName })
    }
  }

  // Create teams and assign members
  for (const [groupNum, members] of Object.entries(groupedStudents)) {
    if (groupNum === 'ungrouped') continue

    const schoolName = (members as any[])[0]?.schoolName || 'Unknown School'
    
    // Create team
    const { data: team } = await supabase
      .from('teams')
      .insert({
        event_id: eventId,
        team_name: `Team ${groupNum}`,
        school_name: schoolName,
        team_size: (members as any[]).length,
      })
      .select()
      .single()

    if (team) {
      // Add team members
      const teamMembers = createdUsers
        .filter(u => u.groupNumber === groupNum)
        .map((u, index) => ({
          team_id: team.id,
          user_id: u.id,
          role: index === 0 ? 'lead' : 'member',
        }))

      await supabase.from('team_members').insert(teamMembers)
    }
  }

  return NextResponse.json({ success: true, count: createdUsers.length })
}
