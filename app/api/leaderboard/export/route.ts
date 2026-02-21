import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export async function POST(request: NextRequest) {
  try {
    const { eventId } = await request.json()
    
    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Fetch event details
    const { data: event } = await supabase
      .from('events')
      .select('name')
      .eq('id', eventId)
      .single()

    // Fetch teams with rankings
    const { data: teams } = await supabase
      .from('teams')
      .select('id, team_name, school_name, domain, stall_no, total_score')
      .eq('event_id', eventId)
      .order('total_score', { ascending: false })

    if (!teams || teams.length === 0) {
      return NextResponse.json({ error: 'No teams found' }, { status: 404 })
    }

    // Fetch members for all teams
    const teamsWithMembers = await Promise.all(
      teams.map(async (team) => {
        const { data: members } = await supabase
          .from('team_members')
          .select(`
            user_id,
            users!inner (
              full_name,
              email,
              enrollment_number
            )
          `)
          .eq('team_id', team.id)

        return {
          ...team,
          members: members?.map(m => m.users) || []
        }
      })
    )

    // Generate PDF
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    
    // Title
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('Leaderboard Rankings', pageWidth / 2, 15, { align: 'center' })
    
    // Event name
    doc.setFontSize(11)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100)
    doc.text(event?.name || 'Unknown Event', pageWidth / 2, 22, { align: 'center' })
    
    let yPosition = 30

    teamsWithMembers.forEach((team, index) => {
      const rank = index + 1
      
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage()
        yPosition = 20
      }

      // Team header box
      doc.setFillColor(245, 245, 245)
      doc.rect(10, yPosition, pageWidth - 20, 12, 'F')
      
      // Rank and team name
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0)
      
      // Rank with color
      if (rank === 1) doc.setTextColor(212, 175, 55)
      else if (rank === 2) doc.setTextColor(192, 192, 192)
      else if (rank === 3) doc.setTextColor(205, 127, 50)
      
      doc.text(`#${rank}`, 12, yPosition + 8)
      
      doc.setTextColor(0)
      doc.text(team.team_name, 25, yPosition + 8)
      
      // Score
      doc.setFont('helvetica', 'bold')
      doc.text(`${team.total_score || 0} pts`, pageWidth - 12, yPosition + 8, { align: 'right' })
      
      yPosition += 14

      // Team info
      doc.setFontSize(9)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(80)
      let infoText = `School: ${team.school_name || 'N/A'}`
      if (team.domain) infoText += ` | Domain: ${team.domain}`
      if (team.stall_no) infoText += ` | Stall: ${team.stall_no}`
      doc.text(infoText, 12, yPosition + 3)
      
      yPosition += 8

      // Members section
      if (team.members && team.members.length > 0) {
        doc.setFontSize(10)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(0)
        doc.text(`Team Members (${team.members.length})`, 12, yPosition + 3)
        
        yPosition += 6

        // Members table
        const memberRows = team.members.map((member: any) => [
          member.full_name || 'Unknown',
          member.email || '',
          member.enrollment_number || 'N/A'
        ])

        autoTable(doc, {
          startY: yPosition,
          head: [['Name', 'Email', 'Enrollment']],
          body: memberRows,
          margin: { left: 12, right: 12 },
          theme: 'grid',
          headStyles: { 
            fillColor: [240, 240, 240], 
            textColor: [0, 0, 0],
            fontSize: 8,
            fontStyle: 'bold'
          },
          bodyStyles: { 
            fontSize: 8,
            textColor: [60, 60, 60]
          },
          columnStyles: {
            0: { cellWidth: 50 },
            1: { cellWidth: 70 },
            2: { cellWidth: 40 }
          },
          didDrawPage: (data) => {
            yPosition = data.cursor?.y || yPosition
          }
        })

        yPosition = (doc as any).lastAutoTable.finalY + 8
      } else {
        doc.setFontSize(9)
        doc.setFont('helvetica', 'italic')
        doc.setTextColor(150)
        doc.text('No members', 12, yPosition + 3)
        yPosition += 8
      }

      yPosition += 2
    })

    // Add footer to all pages
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(120)
      doc.text('Copyright Gaming Network Studio Media Group', pageWidth / 2, 285, { align: 'center' })
      doc.text('Developed By Group-1', pageWidth / 2, 290, { align: 'center' })
    }

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="leaderboard-${eventId}.pdf"`
      }
    })

  } catch (error: any) {
    console.error('Error generating PDF:', error)
    return NextResponse.json({ error: error.message || 'Failed to generate PDF' }, { status: 500 })
  }
}
