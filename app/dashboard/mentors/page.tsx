'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Users, Search, Mail, Edit, Plus, Upload, Download } from 'lucide-react'
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
  const [editForm, setEditForm] = useState({ full_name: '', email: '', department: '' })
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [addForm, setAddForm] = useState({ full_name: '', email: '', password: '', department: '' })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      const { error } = await supabase
        .from('users')
        .update({
          full_name: editForm.full_name,
          email: editForm.email,
          department: editForm.department || null
        })
        .eq('id', editMentor.id)

      if (error) throw error

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
    const csvContent = 'email,full_name,password,department\nmentor1@example.com,John Mentor,password123,Computer Engineering\nmentor2@example.com,Jane Mentor,password456,Information Technology'
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mentor-template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const openEditDialog = (mentor: any) => {
    setEditMentor(mentor)
    setEditForm({
      full_name: mentor.full_name || '',
      email: mentor.email || '',
      department: mentor.department || ''
    })
  }

  const filteredMentors = mentors.filter((mentor: any) => 
    mentor.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mentor.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mentor Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage mentor accounts</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowAddDialog(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Mentor
          </Button>
          <Button onClick={downloadCSVTemplate} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Template
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 text-center">
          <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold">{mentors.length}</p>
          <p className="text-sm text-muted-foreground">Total Mentors</p>
        </CardContent>
      </Card>

      <Tabs defaultValue="mentors" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="mentors">All Mentors ({mentors.length})</TabsTrigger>
          <TabsTrigger value="import">Import Mentors</TabsTrigger>
        </TabsList>
        
        <TabsContent value="import">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Import Mentors</h3>
                <form onSubmit={handleFileUpload} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Upload File *</Label>
                    <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
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
                        <p className="text-sm font-medium text-green-600 mt-2">✓ {selectedFile.name}</p>
                      )}
                    </div>
                  </div>
                  <Button type="submit" disabled={loading || !selectedFile} className="w-full">
                    {loading ? 'Importing...' : 'Import Mentors'}
                  </Button>
                </form>
              </CardContent>
            </Card>
            <Card className="bg-muted/30">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">Instructions</h3>
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div>
                    <p className="font-medium text-foreground mb-1">1. Download Template</p>
                    <p>Click Template button to get CSV format</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-1">2. Fill Mentor Data</p>
                    <p>Add: email, name, password, department</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-1">3. Upload File</p>
                    <p>Upload CSV/Excel to import mentors</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="mentors" className="space-y-4">
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search mentors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {filteredMentors.length > 0 ? (
        <div className="space-y-3">
          {filteredMentors.map((mentor: any) => (
            <Card key={mentor.id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center text-primary font-bold text-lg flex-shrink-0">
                    {mentor.full_name?.charAt(0)?.toUpperCase() || 'M'}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm mb-1">{mentor.full_name}</div>
                    <Badge variant="secondary" className="text-xs mb-2">Mentor</Badge>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">{mentor.email}</span>
                    </div>
                    {mentor.department && (
                      <div className="text-xs text-muted-foreground mt-1">{mentor.department}</div>
                    )}
                  </div>
                  
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(mentor)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No mentors found</h3>
          </CardContent>
        </Card>
      )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!editMentor} onOpenChange={(open) => !open && setEditMentor(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Mentor</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditMentor} className="space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={editForm.full_name}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Input
                value={editForm.department}
                onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                placeholder="e.g. Computer Engineering"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Saving...' : 'Save'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditMentor(null)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
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
    </div>
  )
}
