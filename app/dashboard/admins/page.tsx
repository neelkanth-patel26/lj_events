'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Users, Search, Mail, Edit, Plus, Trash2, Shield, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useState, useCallback, useEffect } from 'react'
import useSWR from 'swr'
import { useRealtimeData } from '@/hooks/useRealtimeData'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function AdminsPage() {
  const { data: allUsers, mutate } = useSWR('/api/users', fetcher)
  const admins = allUsers?.filter((u: any) => u.role === 'admin') || []
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editAdmin, setEditAdmin] = useState<any>(null)
  const [editForm, setEditForm] = useState({ full_name: '', email: '', department: '' })
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [addForm, setAddForm] = useState({ full_name: '', email: '', password: '', department: '' })
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()
        setUserRole(data?.role || null)
      } catch (error) {
        console.error('Error fetching role:', error)
        setUserRole(null)
      }
    }
    fetchRole()
  }, [])

  const handleDataChange = useCallback(() => {
    mutate()
  }, [mutate])
  
  useRealtimeData(handleDataChange, ['users'])

  const handleEditAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editAdmin) return

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
        .eq('id', editAdmin.id)

      if (error) throw error

      setEditAdmin(null)
      mutate()
      alert('Admin updated successfully')
    } catch (error: any) {
      alert('Failed to update admin: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const supabase = createClient()
      const passwordHash = Buffer.from(addForm.password).toString('base64')
      
      const { error } = await supabase.from('users').insert({
        email: addForm.email,
        full_name: addForm.full_name,
        password_hash: passwordHash,
        role: 'admin',
        department: addForm.department || null
      })

      if (error) throw error

      setShowAddDialog(false)
      setAddForm({ full_name: '', email: '', password: '', department: '' })
      mutate()
      alert('Admin added successfully')
    } catch (error: any) {
      alert('Failed to add admin: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAdmin = async (adminId: string, adminName: string) => {
    if (!confirm(`Delete ${adminName}? This cannot be undone.`)) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/students/delete?id=${adminId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete admin')
      mutate()
      alert('Admin deleted successfully')
    } catch (error: any) {
      alert('Failed to delete admin: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const openEditDialog = (admin: any) => {
    setEditAdmin(admin)
    setEditForm({
      full_name: admin.full_name || '',
      email: admin.email || '',
      department: admin.department || ''
    })
  }

  const filteredAdmins = admins.filter((admin: any) => 
    admin.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    admin.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (userRole !== 'admin') {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="h-16 w-16 mx-auto text-red-600 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">Only admins can access this page.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Admin Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage administrator accounts</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Admin
        </Button>
      </div>

      <Card className="dark:bg-neutral-900 dark:border-neutral-800">
        <CardContent className="p-4 text-center">
          <Shield className="h-8 w-8 mx-auto mb-2 text-gray-700 dark:text-neutral-400" />
          <p className="text-2xl font-bold dark:text-white">{admins.length}</p>
          <p className="text-sm text-muted-foreground">Total Admins</p>
        </CardContent>
      </Card>

      <Card className="dark:bg-neutral-900 dark:border-neutral-800">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search admins..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {filteredAdmins.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAdmins.map((admin: any) => (
            <Card key={admin.id} className="hover:shadow-lg transition-shadow dark:bg-neutral-900 dark:border-neutral-800">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-20 h-20 bg-gray-700 dark:bg-neutral-700 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-lg">
                    {admin.full_name?.charAt(0)?.toUpperCase() || 'A'}
                  </div>
                  
                  <div className="space-y-2 w-full">
                    <div className="font-semibold text-lg dark:text-white">{admin.full_name}</div>
                    <Badge variant="default" className="text-xs bg-gray-700">Admin</Badge>
                    
                    <div className="space-y-1.5 pt-2">
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate text-xs">{admin.email}</span>
                      </div>
                      {admin.department && (
                        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate text-xs">{admin.department}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                        <span>{new Date(admin.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 w-full pt-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(admin)} className="h-9">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteAdmin(admin.id, admin.full_name)} className="h-9">
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="dark:bg-neutral-900 dark:border-neutral-800">
          <CardContent className="py-12 text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2 dark:text-white">No admins found</h3>
            <p className="text-sm text-muted-foreground">
              {searchTerm ? 'Try adjusting your search' : 'Add your first admin'}
            </p>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!editAdmin} onOpenChange={(open) => !open && setEditAdmin(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Admin</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditAdmin} className="space-y-4">
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
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditAdmin(null)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Admin</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddAdmin} className="space-y-4">
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
                {loading ? 'Adding...' : 'Add Admin'}
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
