'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Upload, Download, Users, Search, Grid, List, Mail, Calendar, Edit, Hash, UserCircle, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useState, useRef, useCallback } from 'react'
import useSWR from 'swr'
import { useRealtime } from '@/components/realtime-provider'
import { useRealtimeData } from '@/hooks/useRealtimeData'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function StudentsPage() {
  const { students, refreshData } = useRealtime()
  const { data: events, mutate: mutateEvents } = useSWR('/api/events', fetcher)
  
  const handleDataChange = useCallback(() => {
    refreshData()
    mutateEvents()
  }, [refreshData, mutateEvents])
  
  useRealtimeData(handleDataChange, ['users', 'events'])
  const [loading, setLoading] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [editStudent, setEditStudent] = useState<any>(null)
  const [editForm, setEditForm] = useState({ full_name: '', email: '', enrollment_number: '', role: '', department: '' })
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [addForm, setAddForm] = useState({ full_name: '', email: '', password: '', enrollment_number: '', role: 'student', department: '' })
  const [showResultDialog, setShowResultDialog] = useState(false)
  const [importResult, setImportResult] = useState({ users: 0, updated: 0, teams: 0, message: '' })
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string, name: string } | null>(null)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
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
      setImportResult(result)
      setShowResultDialog(true)
    } catch (error: any) {
      console.error('Error importing students:', error)
      alert('Failed to import students: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editStudent) return

    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('users')
        .update({
          full_name: editForm.full_name,
          email: editForm.email,
          enrollment_number: editForm.enrollment_number,
          role: editForm.role,
          department: editForm.department || null
        })
        .eq('id', editStudent.id)

      if (error) throw error

      setEditStudent(null)
      refreshData()
      alert('Student updated successfully')
    } catch (error: any) {
      console.error('Error updating student:', error)
      alert('Failed to update student: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch('/api/students/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addForm)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to add student')
      }

      setShowAddDialog(false)
      setAddForm({ full_name: '', email: '', password: '', enrollment_number: '', role: 'student', department: '' })
      refreshData()
      alert('Student added successfully')
    } catch (error: any) {
      alert('Failed to add student: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    setDeleteTarget({ id: studentId, name: studentName })
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return

    setLoading(true)
    try {
      const response = await fetch(`/api/students/delete?id=${deleteTarget.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete student')
      }

      setShowDeleteDialog(false)
      setDeleteTarget(null)
      refreshData()
      setShowSuccessDialog(true)
    } catch (error: any) {
      alert('Failed to delete student: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const openEditDialog = (student: any) => {
    setEditStudent(student)
    setEditForm({
      full_name: student.full_name || '',
      email: student.email || '',
      enrollment_number: student.enrollment_number || '',
      role: student.role || 'student',
      department: student.department || ''
    })
  }

  const downloadCSVTemplate = () => {
    const csvContent = 'email,full_name,password,group_number,school_name,domain,stall_no,enrollment_number,department\nstudent1@example.com,John Doe,password123,1,Engineering School,AI/ML,A1,2024001,Computer Engineering\nstudent2@example.com,Jane Smith,password456,1,Engineering School,AI/ML,A1,2024002,Computer Engineering\nstudent3@example.com,Bob Johnson,password789,2,Science School,Web Dev,B2,2024003,Information Technology'
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
                         student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.enrollment_number?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || student.role === filterRole
    const isNotMentor = student.role !== 'mentor'
    return matchesSearch && matchesRole && isNotMentor
  }).sort((a: any, b: any) => {
    // Sort by enrollment number
    if (a.enrollment_number && b.enrollment_number) {
      return a.enrollment_number.localeCompare(b.enrollment_number)
    }
    if (a.enrollment_number) return -1
    if (b.enrollment_number) return 1
    return a.full_name?.localeCompare(b.full_name) || 0
  }) || []

  const studentStats = {
    total: students?.filter((s: any) => s.role !== 'mentor').length || 0,
    students: students?.filter((s: any) => s.role === 'student').length || 0,
    admins: students?.filter((s: any) => s.role === 'admin').length || 0
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Student Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Import and manage student accounts</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddDialog(true)} size="sm" className="w-fit">
            <Users className="h-4 w-4 mr-2" />
            Add Student
          </Button>
          <Button onClick={downloadCSVTemplate} variant="outline" size="sm" className="w-fit">
            <Download className="h-4 w-4 mr-2" />
            Template
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-3 md:p-4 text-center">
            <Users className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-primary" />
            <p className="text-xl md:text-2xl font-bold">{studentStats.total}</p>
            <p className="text-xs md:text-sm text-muted-foreground">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4 text-center">
            <UserCircle className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-primary" />
            <p className="text-xl md:text-2xl font-bold">{studentStats.students}</p>
            <p className="text-xs md:text-sm text-muted-foreground">Students</p>
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

      <Tabs defaultValue="students" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="students" className="text-xs md:text-sm">All Students ({students?.length || 0})</TabsTrigger>
          <TabsTrigger value="import" className="text-xs md:text-sm">Import Students</TabsTrigger>
        </TabsList>
        
        <TabsContent value="import">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="p-3 md:p-4">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <Upload className="h-4 w-4 md:h-5 md:w-5" />
                  Import Students
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-4 pt-0">
                <form onSubmit={handleFileUpload} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs md:text-sm">Select Event *</Label>
                    <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose event" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.isArray(events) && events.map((event: any) => (
                          <SelectItem key={event.id} value={event.id}>
                            {event.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs md:text-sm">Upload File *</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                      <Input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        className="max-w-xs mx-auto"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        CSV or Excel (.xlsx, .xls)
                      </p>
                      {selectedFile && (
                        <p className="text-sm font-medium text-green-600 mt-2">
                          ✓ {selectedFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={loading || !selectedEvent || !selectedFile} 
                    className="w-full"
                    size="sm"
                  >
                    {loading ? 'Importing...' : 'Import & Create Teams'}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="bg-muted/30">
              <CardHeader className="p-3 md:p-4">
                <CardTitle className="text-base md:text-lg">Instructions</CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-4 pt-0">
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div>
                    <p className="font-medium text-foreground mb-1">1. Download Template</p>
                    <p>Click the Template button above to get the CSV format</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-1">2. Fill Student Data</p>
                    <p>Add student details: email, name, password, group number, enrollment number</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-1">3. Select Event</p>
                    <p>Choose which event these students will participate in</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-1">4. Upload File</p>
                    <p>Upload your CSV/Excel file to import students and auto-create teams</p>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs"><strong>Note:</strong> Students with same group_number will be grouped into one team</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="students" className="space-y-4">
          {/* Controls */}
          <Card>
            <CardContent className="p-3 md:p-4">
              <div className="flex flex-col sm:flex-row gap-3 md:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, email, or enrollment..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={filterRole} onValueChange={setFilterRole}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="student">Students</SelectItem>
                      <SelectItem value="admin">Admins</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="hidden md:flex border rounded-md">
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
            <>
              <div className="flex items-center justify-between px-1">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredStudents.length} of {students?.length || 0} students
                </p>
              </div>
              
              {viewMode === 'grid' ? (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredStudents.map((student: any) => {
                    const isSpecial = ['23012250210200', '23012250210201', '23012250210208'].includes(student.enrollment_number)
                    return (
                    <Card key={student.id} className={`hover:shadow-lg transition-all ${isSpecial ? 'ring-2 ring-primary bg-gradient-to-br from-primary/5 to-primary/10' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`w-12 h-12 ${isSpecial ? 'bg-gradient-to-br from-primary to-primary/70' : 'bg-gradient-to-br from-primary/20 to-primary/5'} rounded-full flex items-center justify-center ${isSpecial ? 'text-white' : 'text-primary'} font-bold text-lg flex-shrink-0`}>
                            {student.full_name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <h3 className="font-semibold text-base truncate">{student.full_name}</h3>
                                {isSpecial && <span className="text-xs text-primary font-semibold">⭐ Platform Developer</span>}
                              </div>
                              <div className="flex gap-1">
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEditDialog(student)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleDeleteStudent(student.id, student.full_name)}>
                                  <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                              </div>
                            </div>
                            <Badge variant={student.role === 'admin' ? 'default' : student.role === 'mentor' ? 'secondary' : 'outline'} className="text-xs mb-3">
                              {student.role}
                            </Badge>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                                <span className="truncate">{student.email}</span>
                              </div>
                              {student.enrollment_number && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Hash className="h-3.5 w-3.5 flex-shrink-0" />
                                  <span>{student.enrollment_number}</span>
                                </div>
                              )}
                              {student.department && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <UserCircle className="h-3.5 w-3.5 flex-shrink-0" />
                                  <span>{student.department}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                                <span>{new Date(student.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )})}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredStudents.map((student: any) => {
                    const isSpecial = ['23012250210200', '23012250210201', '23012250210208'].includes(student.enrollment_number)
                    return (
                    <Card key={student.id} className={`border-l-4 ${isSpecial ? 'border-l-primary bg-gradient-to-r from-primary/5 to-transparent' : 'border-l-transparent'}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 ${isSpecial ? 'bg-gradient-to-br from-primary to-primary/70' : 'bg-gradient-to-br from-primary/20 to-primary/5'} rounded-lg flex items-center justify-center ${isSpecial ? 'text-white' : 'text-primary'} font-bold text-lg flex-shrink-0`}>
                            {student.full_name?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          
                          <div className="flex-1 min-w-0 grid md:grid-cols-5 gap-3 items-center">
                            <div className="min-w-0">
                              <div className="font-semibold text-sm mb-1">
                                {student.full_name}
                                {isSpecial && <span className="ml-2 text-xs text-primary font-semibold">⭐ Platform Developer</span>}
                              </div>
                              <Badge variant={student.role === 'admin' ? 'default' : student.role === 'mentor' ? 'secondary' : 'outline'} className="text-xs">
                                {student.role}
                              </Badge>
                            </div>
                            
                            <div className="md:col-span-2 min-w-0">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                                <span className="truncate">{student.email}</span>
                              </div>
                            </div>
                            
                            <div>
                              {student.enrollment_number ? (
                                <div className="flex items-center gap-2">
                                  <div className={`px-2 py-1 rounded text-xs font-mono ${isSpecial ? 'bg-primary text-white' : 'bg-muted'}`}>
                                    {student.enrollment_number}
                                  </div>
                                </div>
                              ) : (
                                <span className="text-xs text-muted-foreground italic">No enrollment</span>
                              )}
                              {student.department && (
                                <div className="text-xs text-muted-foreground mt-1">{student.department}</div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                              <span className="hidden lg:inline">{new Date(student.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              <span className="lg:hidden">{new Date(student.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="flex-shrink-0" onClick={() => openEditDialog(student)}>
                              <Edit className="h-4 w-4 mr-1" />
                              <span className="hidden sm:inline">Edit</span>
                            </Button>
                            <Button variant="outline" size="sm" className="flex-shrink-0" onClick={() => handleDeleteStudent(student.id, student.full_name)}>
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )})}
                </div>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {searchTerm || filterRole !== 'all' ? 'No students found' : 'No students yet'}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {searchTerm || filterRole !== 'all' 
                      ? 'Try adjusting your search or filters' 
                      : 'Import students using the Import Students tab'}
                  </p>
                  {(searchTerm || filterRole !== 'all') && (
                    <Button variant="outline" size="sm" onClick={() => { setSearchTerm(''); setFilterRole('all') }}>
                      Clear Filters
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={!!editStudent} onOpenChange={(open) => !open && setEditStudent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditStudent} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={editForm.full_name}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-enrollment">Enrollment Number</Label>
              <Input
                id="edit-enrollment"
                value={editForm.enrollment_number}
                onChange={(e) => setEditForm({ ...editForm, enrollment_number: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-department">Department</Label>
              <Input
                id="edit-department"
                value={editForm.department}
                onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                placeholder="e.g. Computer Engineering"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select value={editForm.role} onValueChange={(value) => setEditForm({ ...editForm, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="mentor">Mentor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditStudent(null)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Student</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddStudent} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="add-name">Full Name</Label>
              <Input
                id="add-name"
                value={addForm.full_name}
                onChange={(e) => setAddForm({ ...addForm, full_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-email">Email</Label>
              <Input
                id="add-email"
                type="email"
                value={addForm.email}
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-password">Password</Label>
              <Input
                id="add-password"
                type="password"
                value={addForm.password}
                onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-enrollment">Enrollment Number</Label>
              <Input
                id="add-enrollment"
                value={addForm.enrollment_number}
                onChange={(e) => setAddForm({ ...addForm, enrollment_number: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-department">Department</Label>
              <Input
                id="add-department"
                value={addForm.department}
                onChange={(e) => setAddForm({ ...addForm, department: e.target.value })}
                placeholder="e.g. Computer Engineering"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-role">Role</Label>
              <Select value={addForm.role} onValueChange={(value) => setAddForm({ ...addForm, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="mentor">Mentor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Adding...' : 'Add Student'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Import Result Dialog */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Upload className="h-5 w-5 text-gray-700" />
              </div>
              Import Complete
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                <p className="text-3xl font-bold text-gray-900">{importResult.users}</p>
                <p className="text-xs text-gray-600 mt-1 font-medium">New Users</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                <p className="text-3xl font-bold text-gray-900">{importResult.updated}</p>
                <p className="text-xs text-gray-600 mt-1 font-medium">Updated</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg border-2 border-gray-200">
                <p className="text-3xl font-bold text-gray-900">{importResult.teams}</p>
                <p className="text-xs text-gray-600 mt-1 font-medium">Teams</p>
              </div>
            </div>
            <div className="p-4 bg-gray-100 rounded-lg border-2 border-gray-200">
              <p className="text-sm text-gray-700">{importResult.message}</p>
            </div>
            <Button onClick={() => setShowResultDialog(false)} className="w-full bg-gray-900 hover:bg-gray-800">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              Delete Student
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-red-900">
                Are you sure you want to delete <span className="font-bold">{deleteTarget?.name}</span>?
              </p>
              <p className="text-xs text-red-700 mt-2">
                This action cannot be undone. All associated data will be permanently removed.
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowDeleteDialog(false)} 
                className="flex-1"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={confirmDelete} 
                className="flex-1"
                disabled={loading}
              >
                {loading ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="sr-only">Success</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Success!</h3>
              <p className="text-sm text-gray-600">Student deleted successfully</p>
            </div>
            <Button onClick={() => setShowSuccessDialog(false)} className="w-full">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
