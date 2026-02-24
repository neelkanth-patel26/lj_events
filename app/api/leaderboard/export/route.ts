import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export async function POST(request: NextRequest) {
  try {
    const { eventId, type = 'full' } = await request.json()
    
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

    // Filter teams based on type
    const filteredTeams = type === 'top5' ? teamsWithMembers.slice(0, 5) : teamsWithMembers

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    
    // Professional color palette
    const navy = [25, 42, 86]
    const gold = [212, 175, 55]
    const lightGray = [248, 249, 250]
    const darkGray = [52, 58, 64]
    
    // Compact header
    doc.setFillColor(...navy)
    doc.rect(0, 0, pageWidth, 18, 'F')
    
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text(type === 'top5' ? 'TOP 5 LEADERBOARD' : 'LEADERBOARD', 10, 8)
    
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(event?.name || 'Unknown Event', 10, 13)
    
    doc.setTextColor(200, 200, 200)
    doc.setFontSize(7)
    doc.text(new Date().toLocaleDateString(), pageWidth - 10, 11, { align: 'right' })
    
    let yPosition = 24

    if (type === 'full') {
      // Compact grid layout for full PDF - 3 columns
      let currentPageStartRow = 0
      const rowHeights: number[] = []
      
      // First pass: calculate all card heights
      const cardHeights = filteredTeams.map((team) => {
        const baseHeight = 35
        const criteriaHeight = team.criterionScores?.length ? Math.ceil(team.criterionScores.length / 2) * 4 + 4 : 0
        // Calculate member pills height (estimate 2 rows max)
        const membersHeight = team.members?.length ? Math.min(Math.ceil(team.members.length / 3), 2) * 5 + 6 : 0
        return baseHeight + criteriaHeight + membersHeight
      })
      
      // Group teams into rows and calculate row heights
      for (let i = 0; i < filteredTeams.length; i += 3) {
        const rowIndex = Math.floor(i / 3)
        const rowTeams = [cardHeights[i], cardHeights[i + 1] || 0, cardHeights[i + 2] || 0]
        rowHeights[rowIndex] = Math.max(...rowTeams)
      }
      
      filteredTeams.forEach((team, index) => {
        const rank = index + 1
        const col = index % 3
        const row = Math.floor(index / 3)
        
        const cardHeight = cardHeights[index]
        const rowHeight = rowHeights[row]
        
        // Calculate yPosition based on previous row heights from current page start
        let calculatedY = 24
        for (let i = currentPageStartRow; i < row; i++) {
          calculatedY += (rowHeights[i] || 0) + 3
        }
        
        // Check if entire row fits on current page (check at start of row)
        if (col === 0 && calculatedY + rowHeight > pageHeight - 25) {
          doc.addPage()
          calculatedY = 24
          currentPageStartRow = row
        }
        
        const colWidth = (pageWidth - 26) / 3
        const xStart = 10 + (col * colWidth)
        const cardWidth = colWidth - 4
        
        // Rank badge
        let rankColor = darkGray
        if (rank === 1) rankColor = gold
        else if (rank === 2) rankColor = [192, 192, 192]
        else if (rank === 3) rankColor = [205, 127, 50]
        
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...rankColor)
        doc.text(`${rank}`, xStart + 4, calculatedY + 7)
        
        // Card background
        doc.setFillColor(...lightGray)
        doc.roundedRect(xStart + 8, calculatedY, cardWidth - 8, cardHeight, 2, 2, 'F')
        
        // Team name
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...navy)
        let teamName = team.team_name
        const maxNameWidth = cardWidth - 30
        if (doc.getTextWidth(teamName) > maxNameWidth) {
          while (doc.getTextWidth(teamName + '...') > maxNameWidth && teamName.length > 0) {
            teamName = teamName.slice(0, -1)
          }
          teamName += '...'
        }
        doc.text(teamName, xStart + 11, calculatedY + 6)
        
        // Score
        doc.setFontSize(11)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...gold)
        doc.text(`${team.total_score || 0}`, xStart + cardWidth - 5, calculatedY + 6, { align: 'right' })
        doc.setFontSize(6)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(120, 120, 120)
        doc.text('pts', xStart + cardWidth - 5, calculatedY + 10, { align: 'right' })
        
        let contentY = calculatedY + 12
        
        // School info
        doc.setFontSize(7)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(100, 100, 100)
        let schoolName = team.school_name || 'N/A'
        if (doc.getTextWidth(schoolName) > cardWidth - 18) {
          while (doc.getTextWidth(schoolName + '...') > cardWidth - 18 && schoolName.length > 0) {
            schoolName = schoolName.slice(0, -1)
          }
          schoolName += '...'
        }
        doc.text(schoolName, xStart + 11, contentY)
        contentY += 5
        
        // Tags
        let tagX = xStart + 11
        if (team.domain) {
          doc.setFillColor(41, 128, 185)
          const domainWidth = Math.min(doc.getTextWidth(team.domain) + 4, cardWidth - 20)
          doc.roundedRect(tagX, contentY - 3, domainWidth, 4.5, 0.5, 0.5, 'F')
          doc.setFontSize(6)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(255, 255, 255)
          doc.text(team.domain, tagX + 2, contentY)
          tagX += domainWidth + 2
        }
        
        if (team.stall_no && tagX < xStart + cardWidth - 15) {
          doc.setFillColor(155, 89, 182)
          const stallText = `S${team.stall_no}`
          const stallWidth = doc.getTextWidth(stallText) + 4
          doc.roundedRect(tagX, contentY - 3, stallWidth, 4.5, 0.5, 0.5, 'F')
          doc.setFontSize(6)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(255, 255, 255)
          doc.text(stallText, tagX + 2, contentY)
        }
        contentY += 5
        
        // Criterion scores
        if (team.criterionScores && team.criterionScores.length > 0) {
          doc.setFontSize(7)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(...navy)
          doc.text('Scores:', xStart + 11, contentY)
          contentY += 4
          
          doc.setFontSize(6.5)
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(70, 70, 70)
          
          const critWidth = (cardWidth - 18) / 2
          team.criterionScores.forEach((criterion: any, idx: number) => {
            const critCol = idx % 2
            const critRow = Math.floor(idx / 2)
            const critX = xStart + 11 + (critCol * critWidth)
            const critY = contentY + (critRow * 4)
            
            let critName = criterion.name
            if (doc.getTextWidth(critName) > critWidth - 12) {
              critName = critName.substring(0, 8) + '...'
            }
            
            doc.text(critName, critX, critY)
            doc.setFont('helvetica', 'bold')
            doc.setTextColor(...navy)
            doc.text(`${criterion.total}`, critX + critWidth - 3, critY, { align: 'right' })
            doc.setFont('helvetica', 'normal')
            doc.setTextColor(70, 70, 70)
          })
          contentY += Math.ceil(team.criterionScores.length / 2) * 4 + 2
        }
        
        // Team members - pill style
        if (team.members && team.members.length > 0) {
          doc.setFontSize(7)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(...navy)
          doc.text(`Members:`, xStart + 11, contentY)
          contentY += 4
          
          // Display members as pills
          let pillX = xStart + 11
          const maxPillWidth = cardWidth - 16
          
          team.members.forEach((member: any, idx: number) => {
            let memberName = member.full_name || 'Unknown'
            
            doc.setFontSize(6)
            doc.setFont('helvetica', 'normal')
            const nameWidth = doc.getTextWidth(memberName)
            const pillWidth = nameWidth + 4
            
            // Check if pill fits on current line
            if (pillX + pillWidth > xStart + maxPillWidth) {
              pillX = xStart + 11
              contentY += 5
            }
            
            // Draw pill background
            doc.setFillColor(220, 220, 220)
            doc.roundedRect(pillX, contentY - 3, pillWidth, 4.5, 1, 1, 'F')
            
            // Draw member name
            doc.setTextColor(60, 60, 60)
            doc.text(memberName, pillX + 2, contentY)
            
            pillX += pillWidth + 2
          })
          
          contentY += 2
        }
      })
    } else {
      // Detailed layout for top 5
      filteredTeams.forEach((team, index) => {
      const rank = index + 1
      
      // Calculate required space for this team
      const criterionHeight = team.criterionScores?.length ? Math.ceil(team.criterionScores.length / 2) * 6 + 14 : 0
      const membersHeight = team.members?.length ? (team.members.length * 6) + 20 : 0
      const totalHeight = 30 + criterionHeight + membersHeight
      
      // Check if we need a new page
      if (yPosition + totalHeight > pageHeight - 25) {
        doc.addPage()
        yPosition = 20
      }

      // Rank number with color
      let rankColor = darkGray
      if (rank === 1) rankColor = gold
      else if (rank === 2) rankColor = [192, 192, 192]
      else if (rank === 3) rankColor = [205, 127, 50]
      
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...rankColor)
      doc.text(`${rank}`, 14, yPosition + 9)
      
      // Team card with subtle shadow effect
      doc.setFillColor(...lightGray)
      doc.roundedRect(22, yPosition, pageWidth - 32, 14, 2, 2, 'F')
      
      // Team name - truncate if too long
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...navy)
      const maxNameWidth = pageWidth - 70
      let teamName = team.team_name
      if (doc.getTextWidth(teamName) > maxNameWidth) {
        while (doc.getTextWidth(teamName + '...') > maxNameWidth && teamName.length > 0) {
          teamName = teamName.slice(0, -1)
        }
        teamName += '...'
      }
      doc.text(teamName, 26, yPosition + 6)
      
      // Score with elegant styling
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...gold)
      doc.text(`${team.total_score || 0}`, pageWidth - 14, yPosition + 7, { align: 'right' })
      
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(120, 120, 120)
      doc.text('POINTS', pageWidth - 14, yPosition + 11, { align: 'right' })
      
      // School info - truncate if too long
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 100, 100)
      let schoolName = team.school_name || 'N/A'
      const maxSchoolWidth = pageWidth - 100
      if (doc.getTextWidth(schoolName) > maxSchoolWidth) {
        while (doc.getTextWidth(schoolName + '...') > maxSchoolWidth && schoolName.length > 0) {
          schoolName = schoolName.slice(0, -1)
        }
        schoolName += '...'
      }
      doc.text(schoolName, 26, yPosition + 11)
      
      yPosition += 16
      
      // Tags
      if (team.domain || team.stall_no) {
        let xPos = 22
        
        if (team.domain) {
          doc.setFillColor(41, 128, 185)
          const domainWidth = doc.getTextWidth(team.domain) + 6
          doc.roundedRect(xPos, yPosition, domainWidth, 6, 1, 1, 'F')
          doc.setFontSize(7)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(255, 255, 255)
          doc.text(team.domain, xPos + 3, yPosition + 4)
          xPos += domainWidth + 3
        }
        
        if (team.stall_no) {
          doc.setFillColor(155, 89, 182)
          const stallText = `Stall ${team.stall_no}`
          const stallWidth = doc.getTextWidth(stallText) + 6
          doc.roundedRect(xPos, yPosition, stallWidth, 6, 1, 1, 'F')
          doc.setFontSize(7)
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(255, 255, 255)
          doc.text(stallText, xPos + 3, yPosition + 4)
        }
        
        yPosition += 9
      }

      // Criterion scores
      if (team.criterionScores && team.criterionScores.length > 0) {
        doc.setFillColor(255, 255, 255)
        doc.setDrawColor(220, 220, 220)
        doc.setLineWidth(0.5)
        const boxHeight = Math.ceil(team.criterionScores.length / 2) * 6 + 10
        doc.roundedRect(22, yPosition, pageWidth - 32, boxHeight, 2, 2, 'FD')
        
        doc.setFontSize(8)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...navy)
        doc.text('CRITERION BREAKDOWN', 26, yPosition + 6)
        
        yPosition += 10
        
        const colWidth = (pageWidth - 40) / 2
        team.criterionScores.forEach((criterion: any, idx: number) => {
          const col = idx % 2
          const row = Math.floor(idx / 2)
          const xPos = 26 + (col * colWidth)
          const yPos = yPosition + (row * 6)
          
          doc.setFontSize(7)
          doc.setFont('helvetica', 'normal')
          doc.setTextColor(80, 80, 80)
          
          // Truncate criterion name if too long
          let criterionName = criterion.name
          const maxCriterionWidth = colWidth - 20
          if (doc.getTextWidth(criterionName) > maxCriterionWidth) {
            while (doc.getTextWidth(criterionName + '...') > maxCriterionWidth && criterionName.length > 0) {
              criterionName = criterionName.slice(0, -1)
            }
            criterionName += '...'
          }
          doc.text(criterionName, xPos, yPos)
          
          doc.setFont('helvetica', 'bold')
          doc.setTextColor(...navy)
          doc.text(`${criterion.total}`, xPos + colWidth - 10, yPos, { align: 'right' })
        })
        
        yPosition += Math.ceil(team.criterionScores.length / 2) * 6 + 4
      }

      // Members table
      if (team.members && team.members.length > 0) {
        yPosition += 3
        
        // Members header
        doc.setFillColor(...navy)
        doc.roundedRect(22, yPosition, pageWidth - 32, 7, 1, 1, 'F')
        doc.setFontSize(8)
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(255, 255, 255)
        doc.text(`TEAM MEMBERS (${team.members.length})`, 26, yPosition + 4.5)
        
        yPosition += 9
        
        const memberRows = team.members.map((member: any) => {
          // Truncate long names and emails
          let name = member.full_name || 'Unknown'
          if (name.length > 30) name = name.substring(0, 27) + '...'
          
          let email = member.email || ''
          if (email.length > 35) email = email.substring(0, 32) + '...'
          
          return [
            name,
            member.enrollment_number || 'N/A',
            email
          ]
        })

        autoTable(doc, {
          startY: yPosition,
          head: [['Name', 'Enrollment ID', 'Email Address']],
          body: memberRows,
          margin: { left: 22, right: 10 },
          theme: 'grid',
          headStyles: { 
            fillColor: [240, 240, 240],
            textColor: navy,
            fontSize: 8,
            fontStyle: 'bold',
            cellPadding: 3,
            lineWidth: 0.1,
            lineColor: [200, 200, 200]
          },
          bodyStyles: { 
            fontSize: 8,
            textColor: [40, 40, 40],
            cellPadding: 3,
            lineWidth: 0.1,
            lineColor: [220, 220, 220]
          },
          columnStyles: {
            0: { cellWidth: 55, fontStyle: 'bold', textColor: navy },
            1: { cellWidth: 28, halign: 'center', fillColor: [252, 252, 252] },
            2: { cellWidth: 'auto', textColor: [80, 80, 80] }
          }
        })

        yPosition = (doc as any).lastAutoTable.finalY + 5
      }

      // Separator
      doc.setDrawColor(230, 230, 230)
      doc.setLineWidth(0.5)
      doc.line(10, yPosition, pageWidth - 10, yPosition)
      yPosition += 8
    })
    }

    // Footer
    const pageCount = doc.getNumberOfPages()
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      
      // Footer line
      doc.setDrawColor(...navy)
      doc.setLineWidth(0.8)
      doc.line(10, pageHeight - 18, pageWidth - 10, pageHeight - 18)
      
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 100, 100)
      doc.text('Gaming Network Studio Media Group', 10, pageHeight - 12)
      doc.text('Developed By Group-1', 10, pageHeight - 8)
      
      // Page number - elegant right-aligned
      doc.setFontSize(7)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(120, 120, 120)
      doc.text('Page', pageWidth - 24, pageHeight - 10)
      
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...gold)
      doc.text(`${i}`, pageWidth - 16, pageHeight - 10)
      
      doc.setFontSize(8)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(150, 150, 150)
      doc.text(`of ${pageCount}`, pageWidth - 12, pageHeight - 10)
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
