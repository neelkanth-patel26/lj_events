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

    const { data: event } = await supabase
      .from('events')
      .select('name')
      .eq('id', eventId)
      .single()

    const { data: teams } = await supabase
      .from('teams')
      .select('id, team_name, school_name, domain, stall_no, total_score')
      .eq('event_id', eventId)
      .order('total_score', { ascending: false })

    if (!teams || teams.length === 0) {
      return NextResponse.json({ error: 'No teams found' }, { status: 404 })
    }

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

        const { data: scores } = await supabase
          .from('scores')
          .select(`
            score,
            evaluation_criteria:criteria_id(
              id,
              criteria_name
            )
          `)
          .eq('team_id', team.id)
        
        const criterionScores: Record<string, { name: string; total: number }> = {}
        scores?.forEach((s: any) => {
          const criterionId = s.evaluation_criteria?.id
          const criterionName = s.evaluation_criteria?.criteria_name
          if (criterionId && criterionName) {
            if (!criterionScores[criterionId]) {
              criterionScores[criterionId] = { name: criterionName, total: 0 }
            }
            criterionScores[criterionId].total += s.score || 0
          }
        })

        return {
          ...team,
          members: members?.map(m => m.users) || [],
          criterionScores: Object.values(criterionScores)
        }
      })
    )

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    
    // Header
    doc.setFillColor(52, 73, 94)
    doc.rect(0, 0, pageWidth, 28, 'F')
    
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text('Leaderboard Rankings', pageWidth / 2, 12, { align: 'center' })
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(event?.name || 'Unknown Event', pageWidth / 2, 20, { align: 'center' })
    
    let yPosition = 38

    teamsWithMembers.forEach((team, index) => {
      const rank = index + 1
      
      if (yPosition > 245) {
        doc.addPage()
        yPosition = 20
      }

      // Rank badge
      let rankColor = [52, 73, 94]
      if (rank === 1) rankColor = [241, 196, 15]
      else if (rank === 2) rankColor = [189, 195, 199]
      else if (rank === 3) rankColor = [230, 126, 34]
      
      doc.setFillColor(...rankColor)
      doc.circle(17, yPosition + 5, 6, 'F')
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(255, 255, 255)
      doc.text(`${rank}`, 17, yPosition + 7, { align: 'center' })
      
      // Team card
      doc.setFillColor(248, 249, 250)
      doc.rect(26, yPosition, pageWidth - 36, 10, 'F')
      
      doc.setFontSize(11)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0, 0, 0)
      doc.text(team.team_name, 29, yPosition + 6.5)
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(46, 204, 113)
      doc.text(`${team.total_score || 0} pts`, pageWidth - 12, yPosition + 6.5, { align: 'right' })
      
      yPosition += 12
      
      // Info
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 100, 100)
      let info = team.school_name || 'N/A'
      if (team.domain) info += ` • ${team.domain}`
      if (team.stall_no) info += ` • Stall ${team.stall_no}`
      doc.text(info, 12, yPosition + 3)
      
      yPosition += 7

      // Criterion scores
      if (team.criterionScores && team.criterionScores.length > 0) {
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(0, 0, 0)
        doc.text('Scores:', 12, yPosition + 3)
        
        yPosition += 5
        
        doc.setFontSize(8)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(70, 70, 70)
        
        team.criterionScores.forEach((criterion: any) => {
          doc.text(`  • ${criterion.name}: ${criterion.total}`, 12, yPosition + 3)
          yPosition += 4
        })
        
        yPosition += 2
      }

      // Members
      if (team.members && team.members.length > 0) {
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(0, 0, 0)
        doc.text(`Members (${team.members.length}):`, 12, yPosition + 3)
        
        yPosition += 5

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
          theme: 'striped',
          headStyles: { 
            fillColor: [52, 73, 94],
            textColor: [255, 255, 255],
            fontSize: 8,
            fontStyle: 'bold'
          },
          bodyStyles: { 
            fontSize: 7,
            textColor: [50, 50, 50]
          },
          alternateRowStyles: {
            fillColor: [250, 250, 250]
          },
          columnStyles: {
            0: { cellWidth: 50 },
            1: { cellWidth: 70 },
            2: { cellWidth: 35, halign: 'center' }
          }
        })

        yPosition = (doc as any).lastAutoTable.finalY + 6
      }

      // Separator
      doc.setDrawColor(220, 220, 220)
      doc.line(12, yPosition, pageWidth - 12, yPosition)
      yPosition += 6
    })

    // Footer
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(130, 130, 130)
      doc.text('Gaming Network Studio Media Group • Developed By Group-1', pageWidth / 2, pageHeight - 8, { align: 'center' })
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - 12, pageHeight - 8, { align: 'right' })
    }

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
