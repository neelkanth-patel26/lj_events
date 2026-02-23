'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, Search, Mail, Edit, Plus, Upload, Download, Eye, Building, Briefcase, Award, CreditCard, Trash2, LayoutGrid, List } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useState, useCallback, useRef } from 'react'
import useSWR from 'swr'
import { useRealtimeData } from '@/hooks/useRealtimeData'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function MentorsPage() {
  const { data: allUsers, mutate } = useSWR('/api/users', fetcher)
  const mentors = allUsers?.filter((u: any) => u.role === 'mentor') || []
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editMentor, setEditMentor] = useState<any>(null)
  const [editForm, setEditForm] = useState({ 
    full_name: '', 
    email: '', 
    department: '',
    company: '',
    designation: '',
    domain: '',
    experience: '',
    bank_name: '',
    acc_no: '',
    ifsc: '',
    branch: ''
  })
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [addForm, setAddForm] = useState({ full_name: '', email: '', password: '', department: '' })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [viewProfile, setViewProfile] = useState<any>(null)
  const [profileData, setProfileData] = useState<any>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  const handleDataChange = useCallback(() => {
    mutate()
  }, [mutate])
  
  useRealtimeData(handleDataChange, ['users'])

  const handleEditMentor = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editMentor) return

    setLoading(true)
    try {
      const supabase = createClient()
      const { error: userError } = await supabase
        .from('users')
        .update({
          full_name: editForm.full_name,
          email: editForm.email,
          department: editForm.department || null
        })
        .eq('id', editMentor.id)

      if (userError) throw userError

      const response = await fetch('/api/mentors/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: editMentor.id,
          company: editForm.company,
          designation: editForm.designation,
          domain: editForm.domain,
          experience: editForm.experience,
          bank_name: editForm.bank_name,
          acc_no: editForm.acc_no,
          ifsc: editForm.ifsc,
          branch: editForm.branch
        }),
      })
      if (!response.ok) throw new Error('Failed to update profile')

      setEditMentor(null)
      mutate()
      alert('Mentor updated successfully')
    } catch (error: any) {
      alert('Failed to update mentor: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMentor = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const supabase = createClient()
      const passwordHash = Buffer.from(addForm.password).toString('base64')
      
      const { error } = await supabase.from('users').insert({
        email: addForm.email,
        full_name: addForm.full_name,
        password_hash: passwordHash,
        role: 'mentor',
        department: addForm.department || null
      })

      if (error) throw error

      setShowAddDialog(false)
      setAddForm({ full_name: '', email: '', password: '', department: '' })
      mutate()
      alert('Mentor added successfully')
    } catch (error: any) {
      alert('Failed to add mentor: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteMentor = async (mentorId: string, mentorName: string) => {
    if (!confirm(`Delete ${mentorName}? This cannot be undone.`)) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/mentors/delete?userId=${mentorId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete mentor')
      mutate()
      alert('Mentor deleted successfully')
    } catch (error: any) {
      alert('Failed to delete mentor: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) return
    
    setLoading(true)
    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const response = await fetch('/api/mentors/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to import mentors')
      }

      const result = await response.json()
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      mutate()
      alert(result.message || `Success! Created ${result.mentors} mentors`)
    } catch (error: any) {
      alert('Failed to import mentors: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const downloadCSVTemplate = () => {
    const csvContent = 'email,full_name,password,department,company,designation,domain,experience,bank_name,acc_no,ifsc,branch\nmentor1@example.com,John Mentor,password123,Computer Engineering,Tech Corp,Senior Engineer,AI/ML,5 years,HDFC Bank,1234567890,HDFC0001234,Mumbai Branch'
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mentor-template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const openEditDialog = async (mentor: any) => {
    setEditMentor(mentor)
    const supabase = createClient()
    const { data: profile, error } = await supabase
      .from('mentor_profiles')
      .select('*')
      .eq('user_id', mentor.id)
      .maybeSingle()
    
    if (error) {
      console.error('Error loading profile for edit:', error)
    }
    console.log('Edit profile data loaded:', profile)
    
    setEditForm({
      full_name: mentor.full_name || '',
      email: mentor.email || '',
      department: mentor.department || '',
      company: profile?.company || '',
      designation: profile?.designation || '',
      domain: profile?.domain || '',
      experience: profile?.experience || '',
      bank_name: profile?.bank_name || '',
      acc_no: profile?.acc_no || '',
      ifsc: profile?.ifsc || '',
      branch: profile?.branch || ''
    })
  }

  const openProfileDialog = async (mentor: any) => {
    setViewProfile(mentor)
    setProfileLoading(true)
    setProfileData(null)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('mentor_profiles')
      .select('*')
      .eq('user_id', mentor.id)
      .maybeSingle()
    
    if (error) {
      console.error('Error loading profile:', error)
    }
    console.log('Profile data loaded:', data)
    setProfileData(data || {})
    setProfileLoading(false)
  }

  const filteredMentors = mentors.filter((mentor: any) => 
    mentor.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-4 md:space-y-6 pb-20 md:pb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Mentor Management</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">Manage mentor accounts</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddDialog(true)} size="sm" className="flex-1 md:flex-none">
            <Plus className="h-4 w-4 mr-2" />
            Add Mentor
          </Button>
          <Button onClick={downloadCSVTemplate} variant="outline" size="sm" className="flex-1 md:flex-none">
            <Download className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Template</span>
          </Button>
        </div>
      </div>

      <Card className="dark:bg-neutral-900 dark:border-neutral-800">
        <CardContent className="p-3 md:p-4 text-center">
          <Users className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-primary" />
          <p className="text-xl md:text-2xl font-bold dark:text-white">{mentors.length}</p>
          <p className="text-xs md:text-sm text-muted-foreground">Total Mentors</p>
        </CardContent>
      </Card>

      <Tabs defaultValue="mentors" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 dark:bg-neutral-900 dark:border-neutral-800">
          <TabsTrigger value="mentors" className="text-xs md:text-sm dark:data-[state=active]:bg-neutral-800">All Mentors ({mentors.length})</TabsTrigger>
          <TabsTrigger value="import" className="text-xs md:text-sm dark:data-[state=active]:bg-neutral-800">Import Mentors</TabsTrigger>
        </TabsList>
        
        <TabsContent value="import">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="dark:bg-neutral-900 dark:border-neutral-800">
              <CardContent className="p-3 md:p-4">
                <h3 className="font-semibold mb-4 text-sm md:text-base dark:text-white">Import Mentors</h3>
                <form onSubmit={handleFileUpload} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs md:text-sm">Upload File *</Label>
                    <div className="border-2 border-dashed dark:border-neutral-700 rounded-lg p-6 text-center hover:border-primary/50 dark:hover:border-primary/50 transition-colors">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
                      <Input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        className="max-w-xs mx-auto"
                      />
                      <p className="text-xs text-muted-foreground mt-2">CSV or Excel</p>
                      {selectedFile && (
                        <p className="text-sm font-medium text-green-600 dark:text-green-400 mt-2">✓ {selectedFile.name}</p>
                      )}
                    </div>
                  </div>
                  <Button type="submit" disabled={loading || !selectedFile} className="w-full" size="sm">
                    {loading ? 'Importing...' : 'Import Mentors'}
                  </Button>
                </form>
              </CardContent>
            </Card>
            <Card className="bg-muted/30 dark:bg-neutral-900 dark:border-neutral-800">
              <CardContent className="p-3 md:p-4">
                <h3 className="font-semibold mb-4 text-sm md:text-base dark:text-white">Instructions</h3>
                <div className="space-y-3 text-xs md:text-sm text-muted-foreground">
                  <div>
                    <p className="font-medium text-foreground dark:text-gray-300 mb-1">1. Download Template</p>
                    <p>Click Template button to get CSV format</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground dark:text-gray-300 mb-1">2. Fill Mentor Data</p>
                    <p>Add: email, name, password, department, company, designation, domain, experience, bank details</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground dark:text-gray-300 mb-1">3. Upload File</p>
                    <p>Upload CSV/Excel to import mentors</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="mentors" className="space-y-4">
      <Card className="dark:bg-neutral-900 dark:border-neutral-800">
        <CardContent className="p-3 md:p-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search mentors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'bg-accent' : ''}>
                <List className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => setViewMode('grid')} className={viewMode === 'grid' ? 'bg-accent' : ''}>
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {filteredMentors.length > 0 ? (
        viewMode === 'list' ? (
        <div className="space-y-2 md:space-y-3">
          {filteredMentors.map((mentor: any) => (
            <Card key={mentor.id} className="hover:shadow-lg transition-shadow dark:bg-neutral-900 dark:border-neutral-800">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-gray-900 dark:bg-white rounded-full flex items-center justify-center text-white dark:text-gray-900 font-bold text-lg md:text-xl shadow-md flex-shrink-0">
                    {mentor.full_name?.charAt(0)?.toUpperCase() || 'M'}
                  </div>
                  
                  <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
                    <div>
                      <div className="font-semibold text-sm md:text-base mb-1 dark:text-white">{mentor.full_name}</div>
                      <Badge variant="secondary" className="text-xs">Mentor</Badge>
                    </div>
                    
                    <div className="md:col-span-2 space-y-1">
                      <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                        <Mail className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                        <span className="truncate">{mentor.email}</span>
                      </div>
                      {mentor.department && (
                        <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                          <Building className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                          <span className="truncate">{mentor.department}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 flex-shrink-0">
                    <Button variant="outline" size="sm" onClick={() => openProfileDialog(mentor)} className="h-8 px-2 md:px-3">
                      <Eye className="h-4 w-4 md:mr-1" />
                      <span className="hidden md:inline">View</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(mentor)} className="h-8 px-2 md:px-3">
                      <Edit className="h-4 w-4 md:mr-1" />
                      <span className="hidden md:inline">Edit</span>
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteMentor(mentor.id, mentor.full_name)} className="h-8 px-2">
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {filteredMentors.map((mentor: any) => (
            <Card key={mentor.id} className="hover:shadow-lg transition-shadow dark:bg-neutral-900 dark:border-neutral-800">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-900 dark:bg-white rounded-full flex items-center justify-center text-white dark:text-gray-900 font-bold text-2xl md:text-3xl shadow-lg">
                    {mentor.full_name?.charAt(0)?.toUpperCase() || 'M'}
                  </div>
                  
                  <div className="space-y-2 w-full">
                    <div className="font-semibold text-base md:text-lg dark:text-white">{mentor.full_name}</div>
                    <Badge variant="secondary" className="text-xs">Mentor</Badge>
                    
                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate text-xs">{mentor.email}</span>
                      </div>
                      {mentor.department && (
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                          <Building className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate text-xs">{mentor.department}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 w-full pt-2">
                    <Button variant="outline" size="sm" onClick={() => openProfileDialog(mentor)} className="h-8 md:h-9 px-2">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(mentor)} className="h-8 md:h-9 px-2">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteMentor(mentor.id, mentor.full_name)} className="h-8 md:h-9 px-2">
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        )
      ) : (
        <Card className="dark:bg-neutral-900 dark:border-neutral-800">
          <CardContent className="py-8 md:py-12 text-center">
            <Users className="h-10 w-10 md:h-12 md:w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-base md:text-lg font-semibold mb-2 dark:text-white">No mentors found</h3>
          </CardContent>
        </Card>
      )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!editMentor} onOpenChange={(open) => !open && setEditMentor(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto dark:bg-neutral-900 dark:border-neutral-800">
          <DialogHeader>
            <DialogTitle>Edit Mentor</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditMentor} className="space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Mail className="h-4 w-4" />
                  Basic Information
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input
                      value={editForm.full_name}
                      onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Department</Label>
                    <Input
                      value={editForm.department}
                      onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                      placeholder="e.g. Computer Engineering"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Building className="h-4 w-4" />
                  Professional Information
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Company</Label>
                    <Input
                      value={editForm.company}
                      onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                      placeholder="Enter company"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Designation</Label>
                    <Input
                      value={editForm.designation}
                      onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                      placeholder="Enter designation"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Domain</Label>
                    <Input
                      value={editForm.domain}
                      onChange={(e) => setEditForm({ ...editForm, domain: e.target.value })}
                      placeholder="e.g. AI/ML, Web Dev"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Experience</Label>
                    <Input
                      value={editForm.experience}
                      onChange={(e) => setEditForm({ ...editForm, experience: e.target.value })}
                      placeholder="e.g. 5 years"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <CreditCard className="h-4 w-4" />
                  Bank Details
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Bank Name</Label>
                    <Input
                      value={editForm.bank_name}
                      onChange={(e) => setEditForm({ ...editForm, bank_name: e.target.value })}
                      placeholder="Enter bank name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Number</Label>
                    <Input
                      value={editForm.acc_no}
                      onChange={(e) => setEditForm({ ...editForm, acc_no: e.target.value })}
                      placeholder="Enter account number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>IFSC Code</Label>
                    <Input
                      value={editForm.ifsc}
                      onChange={(e) => setEditForm({ ...editForm, ifsc: e.target.value.toUpperCase() })}
                      placeholder="Enter IFSC code"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Branch</Label>
                    <Input
                      value={editForm.branch}
                      onChange={(e) => setEditForm({ ...editForm, branch: e.target.value })}
                      placeholder="Enter branch"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditMentor(null)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="dark:bg-neutral-900 dark:border-neutral-800">
          <DialogHeader>
            <DialogTitle>Add Mentor</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddMentor} className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={addForm.full_name}
                onChange={(e) => setAddForm({ ...addForm, full_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={addForm.email}
                onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={addForm.password}
                onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Input
                value={addForm.department}
                onChange={(e) => setAddForm({ ...addForm, department: e.target.value })}
                placeholder="e.g. Computer Engineering"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Adding...' : 'Add'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewProfile} onOpenChange={(open) => !open && setViewProfile(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto dark:bg-neutral-900 dark:border-neutral-800">
          <DialogHeader>
            <DialogTitle>{viewProfile?.full_name} - Profile Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Mail className="h-4 w-4" />
                  Basic Information
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Email</Label>
                    {profileLoading ? (
                      <div className="h-5 bg-muted animate-pulse rounded"></div>
                    ) : (
                      <p className="text-sm font-medium">{viewProfile?.email || '-'}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Department</Label>
                    {profileLoading ? (
                      <div className="h-5 bg-muted animate-pulse rounded"></div>
                    ) : (
                      <p className="text-sm font-medium">{viewProfile?.department || '-'}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Building className="h-4 w-4" />
                  Professional Information
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Company</Label>
                    {profileLoading ? (
                      <div className="h-5 bg-muted animate-pulse rounded"></div>
                    ) : (
                      <p className="text-sm font-medium">{profileData?.company || '-'}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Designation</Label>
                    {profileLoading ? (
                      <div className="h-5 bg-muted animate-pulse rounded"></div>
                    ) : (
                      <p className="text-sm font-medium">{profileData?.designation || '-'}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Domain</Label>
                    {profileLoading ? (
                      <div className="h-5 bg-muted animate-pulse rounded"></div>
                    ) : (
                      <p className="text-sm font-medium">{profileData?.domain || '-'}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Experience</Label>
                    {profileLoading ? (
                      <div className="h-5 bg-muted animate-pulse rounded"></div>
                    ) : (
                      <p className="text-sm font-medium">{profileData?.experience || '-'}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <CreditCard className="h-4 w-4" />
                  Bank Details
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Bank Name</Label>
                    {profileLoading ? (
                      <div className="h-5 bg-muted animate-pulse rounded"></div>
                    ) : (
                      <p className="text-sm font-medium">{profileData?.bank_name || '-'}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Account Number</Label>
                    {profileLoading ? (
                      <div className="h-5 bg-muted animate-pulse rounded"></div>
                    ) : (
                      <p className="text-sm font-medium">{profileData?.acc_no || '-'}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">IFSC Code</Label>
                    {profileLoading ? (
                      <div className="h-5 bg-muted animate-pulse rounded"></div>
                    ) : (
                      <p className="text-sm font-medium">{profileData?.ifsc || '-'}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label className="text-muted-foreground">Branch</Label>
                    {profileLoading ? (
                      <div className="h-5 bg-muted animate-pulse rounded"></div>
                    ) : (
                      <p className="text-sm font-medium">{profileData?.branch || '-'}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button type="button" variant="outline" onClick={() => setViewProfile(null)} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
