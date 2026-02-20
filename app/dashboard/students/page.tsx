'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Upload, Download, Users, FileText, Search, FileSpreadsheet, Grid, List, Mail, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useState, useRef } from 'react'
import useSWR from 'swr'
import { useRealtime } from '@/components/realtime-provider'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function StudentsPage() {
  const { students, refreshData } = useRealtime()
  const { data: events } = useSWR('/api/events', fetcher)
  const [loading, setLoading] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile || !selectedEvent) return
    
    setLoading(true)
    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('eventId', selectedEvent)

    try {
      const response = await fetch('/api/students/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to import students')
      }

      const result = await response.json()
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      refreshData()
      alert(`Success! Created ${result.users} students and ${result.teams} teams`)
    } catch (error: any) {
      console.error('Error importing students:', error)
      alert('Failed to import students: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const downloadCSVTemplate = () => {
    const csvContent = 'email,full_name,password,group_number,school_name,domain,stall_no\nstudent1@example.com,John Doe,password123,1,Engineering School,AI/ML,A1\nstudent2@example.com,Jane Smith,password456,1,Engineering School,AI/ML,A1\nstudent3@example.com,Bob Johnson,password789,2,Science School,Web Dev,B2'
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'student-template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const filteredStudents = students?.filter((student: any) => {
    const matchesSearch = student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || student.role === filterRole
    return matchesSearch && matchesRole
  }) || []

  const studentStats = {
    total: students?.length || 0,
    students: students?.filter((s: any) => s.role === 'student').length || 0,
    mentors: students?.filter((s: any) => s.role === 'mentor').length || 0,
    admins: students?.filter((s: any) => s.role === 'admin').length || 0
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Student Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Import and manage student accounts</p>
        </div>
        <Button onClick={downloadCSVTemplate} variant="outline" size="sm" className="w-fit">
          <Download className="h-4 w-4 mr-2" />
          Template
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-3 md:p-4 text-center">
            <Users className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-primary" />
            <p className="text-xl md:text-2xl font-bold">{studentStats.total}</p>
            <p className="text-xs md:text-sm text-muted-foreground">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4 text-center">
            <Users className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-primary" />
            <p className="text-xl md:text-2xl font-bold">{studentStats.students}</p>
            <p className="text-xs md:text-sm text-muted-foreground">Students</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4 text-center">
            <Users className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-primary" />
            <p className="text-xl md:text-2xl font-bold">{studentStats.mentors}</p>
            <p className="text-xs md:text-sm text-muted-foreground">Mentors</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4 text-center">
            <Users className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-primary" />
            <p className="text-xl md:text-2xl font-bold">{studentStats.admins}</p>
            <p className="text-xs md:text-sm text-muted-foreground">Admins</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="import" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="import" className="text-xs md:text-sm">File Import</TabsTrigger>
          <TabsTrigger value="students" className="text-xs md:text-sm">All Students ({students?.length || 0})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="import">
          <Card>
            <CardHeader className="p-3 md:p-4">
              <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                <Upload className="h-4 w-4 md:h-5 md:w-5" />
                Import Students from File
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0">
              <form onSubmit={handleFileUpload} className="space-y-4">
                <div className="grid gap-2">
                  <Label className="text-xs md:text-sm">Select Event</Label>
                  <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an event" />
                    </SelectTrigger>
                    <SelectContent>
                      {events?.map((event: any) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.name} - {new Date(event.event_date).toLocaleDateString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label className="text-xs md:text-sm">Upload File (CSV or Excel)</Label>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 md:p-6">
                    <div className="text-center">
                      <Upload className="h-6 w-6 md:h-8 md:w-8 mx-auto text-muted-foreground mb-2" />
                      <div className="space-y-2">
                        <Input
                          ref={fileInputRef}
                          type="file"
                          accept=".csv,.xlsx,.xls"
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                          className="max-w-sm mx-auto text-xs md:text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                          Supported formats: CSV, Excel (.xlsx, .xls)
                        </p>
                        {selectedFile && (
                          <p className="text-xs md:text-sm font-medium text-green-600">
                            Selected: {selectedFile.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={loading || !selectedEvent || !selectedFile} 
                  className="w-full text-xs md:text-sm"
                  size="sm"
                >
                  {loading ? 'Importing...' : 'Import Students & Create Teams'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="students">
          {/* Controls */}
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex flex-col md:flex-row gap-2 md:gap-4 md:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="w-full md:w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="student">Students</SelectItem>
                      <SelectItem value="mentor">Mentors</SelectItem>
                      <SelectItem value="admin">Admins</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex border rounded-md">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="rounded-r-none"
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="rounded-l-none"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Students Display */}
          {filteredStudents && filteredStudents.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid gap-3 md:gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredStudents.map((student: any) => (
                  <Card key={student.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2 p-3 md:p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm md:text-base flex-shrink-0">
                          {student.full_name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm md:text-base truncate">{student.full_name}</h3>
                          <Badge variant={student.role === 'admin' ? 'default' : student.role === 'mentor' ? 'secondary' : 'outline'} className="text-xs">
                            {student.role}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 md:p-4 pt-0">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                          <Mail className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                          <span className="truncate">{student.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                          <span>{new Date(student.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="space-y-1">
                    {filteredStudents.map((student: any) => (
                      <div key={student.id} className="flex items-center justify-between p-3 md:p-4 border-b last:border-b-0 hover:bg-muted/50 transition-colors gap-3">
                        <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                          <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xs md:text-sm flex-shrink-0">
                            {student.full_name?.charAt(0) || 'U'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-sm md:text-base truncate">{student.full_name}</div>
                            <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                              <Mail className="h-3 w-3 flex-shrink-0" />
                              <span className="truncate">{student.email}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="text-right text-xs text-muted-foreground hidden md:block">
                            <div>{new Date(student.created_at).toLocaleDateString()}</div>
                          </div>
                          <Badge variant={student.role === 'admin' ? 'default' : student.role === 'mentor' ? 'secondary' : 'outline'} className="text-xs">
                            {student.role}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          ) : (
            <Card>
              <CardContent className="p-4 md:pt-6">
                <div className="text-center py-6 md:py-8">
                  <Users className="h-10 w-10 md:h-12 md:w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm md:text-base text-muted-foreground">
                    {searchTerm || filterRole !== 'all' ? 'No students match your filters' : 'No students found'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
