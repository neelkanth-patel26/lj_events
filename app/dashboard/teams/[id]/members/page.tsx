'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Users, Mail, ArrowLeft, MapPin, School, Trophy, Edit, Hash, FileText, UserPlus, X, Search, Award, Target } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState, use, useCallback, useEffect } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'
import { useRealtimeData } from '@/hooks/useRealtimeData'

const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json())

export default function TeamMembersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: teamId } = use(params)
  const router = useRouter()
  const { data: team, error, mutate } = useSWR(`/api/teams/${teamId}`, fetcher)
  const { data: eventsData, mutate: mutateEvents } = useSWR('/api/events', fetcher)
  const { data: usersData, mutate: mutateUsers } = useSWR('/api/users', fetcher)
  const [userRole, setUserRole] = useState<string | null>(null)
  
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()
        setUserRole(data?.role || null)
      } catch (error) {
        console.error('Error fetching role:', error)
        setUserRole(null)
      }
    }
    fetchUserRole()
  }, [])
  
  const handleDataChange = useCallback(() => {
    mutate()
    mutateEvents()
    mutateUsers()
  }, [mutate, mutateEvents, mutateUsers])
  
  useRealtimeData(handleDataChange, ['teams', 'team_members', 'users', 'events'])
  const [showEdit, setShowEdit] = useState(false)
  const [showAddMember, setShowAddMember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [searchUser, setSearchUser] = useState('')
  const [editForm, setEditForm] = useState({
    team_name: '',
    school_name: '',
    domain: '',
    stall_no: ''
  })

  const handleEdit = () => {
    setEditForm({
      team_name: team.team_name || '',
      school_name: team.school_name || '',
      domain: team.domain || '',
      stall_no: team.stall_no || ''
    })
    setShowEdit(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('teams')
        .update(editForm)
        .eq('id', teamId)

      if (error) throw error

      setShowEdit(false)
      mutate()
      alert('Team updated successfully')
    } catch (error: any) {
      console.error('Error updating team:', error)
      alert('Failed to update team: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMember = async (userId: string) => {
    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('team_members')
        .insert({
          team_id: teamId,
          user_id: userId,
          role: 'member'
        })

      if (error) throw error

      setShowAddMember(false)
      setSearchUser('')
      mutate()
      alert('Member added successfully')
    } catch (error: any) {
      console.error('Error adding member:', error)
      alert('Failed to add member: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return

    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId)

      if (error) throw error

      mutate()
      alert('Member removed successfully')
    } catch (error: any) {
      console.error('Error removing member:', error)
      alert('Failed to remove member: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (error) return <div className="p-8 text-center text-red-600">Error loading team</div>
  if (!team) return <div className="p-8 text-center">Loading...</div>

  const events = Array.isArray(eventsData) ? eventsData : []
  const users = Array.isArray(usersData) ? usersData : []
  const event = events.find((e: any) => e.id === team.event_id)
  const memberCount = team.team_members?.length || 0
  
  const existingMemberIds = team.team_members?.map((m: any) => m.user_id) || []
  const availableUsers = users.filter((u: any) => 
    !existingMemberIds.includes(u.id) && 
    u.role === 'student' &&
    (u.full_name?.toLowerCase().includes(searchUser.toLowerCase()) || 
     u.email?.toLowerCase().includes(searchUser.toLowerCase()))
  )
  
  const isAdmin = userRole === 'admin'

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl md:text-3xl font-bold">{team.team_name}</h1>
            {team.domain && (
              <Badge variant="outline" className="hidden md:inline-flex">{team.domain}</Badge>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>{event?.name || 'No Event'}</span>
            {team.stall_no && (
              <>
                <span>•</span>
                <span>Stall {team.stall_no}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()} size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          {isAdmin && (
            <Button onClick={handleEdit} size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 md:p-6 text-center">
            <div className="w-12 h-12 md:w-14 md:h-14 mx-auto mb-3 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <Users className="h-6 w-6 md:h-7 md:w-7 text-gray-700" />
            </div>
            <p className="text-2xl md:text-3xl font-bold text-gray-900">{memberCount}</p>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">Members</p>
          </CardContent>
        </Card>
        <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 md:p-6 text-center">
            <div className="w-12 h-12 md:w-14 md:h-14 mx-auto mb-3 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <Trophy className="h-6 w-6 md:h-7 md:w-7 text-gray-700" />
            </div>
            <p className="text-2xl md:text-3xl font-bold text-gray-900">{team.total_score || 0}</p>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">Score</p>
          </CardContent>
        </Card>
        <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 md:p-6 text-center">
            <div className="w-12 h-12 md:w-14 md:h-14 mx-auto mb-3 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <MapPin className="h-6 w-6 md:h-7 md:w-7 text-gray-700" />
            </div>
            <p className="text-xl md:text-2xl font-bold text-gray-900">{team.stall_no || 'N/A'}</p>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">Stall</p>
          </CardContent>
        </Card>
        <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 md:p-6 text-center">
            <div className="w-12 h-12 md:w-14 md:h-14 mx-auto mb-3 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <Award className="h-6 w-6 md:h-7 md:w-7 text-gray-700" />
            </div>
            <p className="text-xl md:text-2xl font-bold text-gray-900">{memberCount > 0 ? Math.round((team.total_score || 0) / memberCount) : 0}</p>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">Avg/Member</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="border-2 shadow-sm lg:col-span-1">
          <CardHeader className="p-4 md:p-5 border-b bg-gradient-to-r from-gray-50 to-white">
            <CardTitle className="text-base md:text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-gray-700" />
              Team Details
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-5 space-y-3">
            {event && (
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border-2 border-blue-200">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">Event</p>
                <p className="text-sm md:text-base font-bold text-blue-900">{event.name}</p>
              </div>
            )}
            {team.school_name && (
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border-2 hover:border-gray-300 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-white border flex items-center justify-center flex-shrink-0">
                  <School className="h-4 w-4 text-gray-700" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 mb-0.5">School</p>
                  <p className="text-sm font-semibold text-gray-900">{team.school_name}</p>
                </div>
              </div>
            )}
            {team.domain && (
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border-2 hover:border-gray-300 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-white border flex items-center justify-center flex-shrink-0">
                  <FileText className="h-4 w-4 text-gray-700" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 mb-0.5">Domain</p>
                  <p className="text-sm font-semibold text-gray-900">{team.domain}</p>
                </div>
              </div>
            )}
            {team.stall_no && (
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border-2 hover:border-gray-300 transition-colors">
                <div className="w-9 h-9 rounded-lg bg-white border flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-4 w-4 text-gray-700" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-medium text-gray-500 mb-0.5">Stall Location</p>
                  <p className="text-sm font-semibold text-gray-900">{team.stall_no}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-2 shadow-sm lg:col-span-2">
          <CardHeader className="p-4 md:p-5 border-b bg-gradient-to-r from-gray-50 to-white">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base md:text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-gray-700" />
                Team Members
                <Badge variant="secondary" className="ml-1">{memberCount}</Badge>
              </CardTitle>
              {isAdmin && (
                <Button onClick={() => setShowAddMember(true)} size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-5">
            {memberCount > 0 ? (
              <div className="space-y-3">
                {team.team_members.map((member: any, index: number) => (
                  <div 
                    key={member.id} 
                    className="group flex items-center gap-4 p-4 border-2 rounded-xl hover:border-gray-400 hover:shadow-md transition-all bg-gradient-to-r from-white to-gray-50"
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-14 h-14 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center font-bold text-lg text-gray-700 shadow-sm">
                        {member.users?.full_name?.charAt(0) || 'M'}
                      </div>
                      <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md border-2 border-white">
                        {index + 1}
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate mb-1">{member.users?.full_name || 'Unknown'}</p>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-3.5 w-3.5" />
                          <span className="truncate">{member.users?.email || 'No email'}</span>
                        </div>
                        {member.users?.enrollment_number && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Hash className="h-3.5 w-3.5" />
                            <span className="font-mono text-xs">{member.users.enrollment_number}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {isAdmin && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRemoveMember(member.id)}
                        disabled={loading}
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-9 w-9 p-0 hover:bg-red-50 hover:text-red-600 flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <Users className="h-10 w-10 text-gray-400" />
                </div>
                <p className="text-xl font-bold text-gray-900 mb-2">No Members Yet</p>
                <p className="text-sm text-gray-500 mb-6">Start building your team by adding members</p>
                {isAdmin && (
                  <Button onClick={() => setShowAddMember(true)} size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team Details</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="team_name">Team Name</Label>
              <Input
                id="team_name"
                value={editForm.team_name}
                onChange={(e) => setEditForm({ ...editForm, team_name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="school_name">School Name</Label>
              <Input
                id="school_name"
                value={editForm.school_name}
                onChange={(e) => setEditForm({ ...editForm, school_name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="domain">Domain</Label>
              <Input
                id="domain"
                value={editForm.domain}
                onChange={(e) => setEditForm({ ...editForm, domain: e.target.value })}
                placeholder="e.g., AI/ML, Web Dev, IoT"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stall_no">Stall Number</Label>
              <Input
                id="stall_no"
                value={editForm.stall_no}
                onChange={(e) => setEditForm({ ...editForm, stall_no: e.target.value })}
                placeholder="e.g., A1, B2"
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowEdit(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {availableUsers.length > 0 ? (
                availableUsers.map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between gap-3 p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        {user.full_name?.charAt(0) || 'U'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate">{user.full_name}</p>
                        <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                        {user.enrollment_number && (
                          <p className="text-xs text-muted-foreground">{user.enrollment_number}</p>
                        )}
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => handleAddMember(user.id)}
                      disabled={loading}
                    >
                      Add
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  {searchUser ? 'No students found' : 'No available students'}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
