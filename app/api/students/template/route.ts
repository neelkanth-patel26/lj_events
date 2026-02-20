import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Create Excel-like CSV content with proper formatting
    const headers = [
      'email',
      'full_name', 
      'password',
      'group_number',
      'school_name',
      'domain',
      'stall_no'
    ]
    
    const sampleData = [
      ['student1@example.com', 'John Doe', 'password123', '1', 'Engineering School', 'AI/ML', 'A1'],
      ['student2@example.com', 'Jane Smith', 'password456', '1', 'Engineering School', 'AI/ML', 'A1'],
      ['student3@example.com', 'Bob Johnson', 'password789', '2', 'Science School', 'Web Dev', 'B2'],
      ['student4@example.com', 'Alice Brown', 'password101', '2', 'Science School', 'Web Dev', 'B2'],
      ['student5@example.com', 'Charlie Wilson', 'password202', '3', 'Arts School', 'Design', 'C3']
    ]
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...sampleData.map(row => row.join(','))
    ].join('\n')
    
    // Return as downloadable file
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="student-template.csv"'
      }
    })
  } catch (error: any) {
    console.error('[API] Error generating template:', error)
    return NextResponse.json(
      { error: 'Failed to generate template' },
      { status: 500 }
    )
  }
}
