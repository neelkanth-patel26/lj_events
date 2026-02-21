'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Users, Mail, ArrowLeft, MapPin, School, Trophy, Calendar, Edit, Hash, FileText, UserPlus, X, Search } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useState, use } from 'react'
import useSWR from 'swr'
import { createClient } from '@/lib/supabase/client'

const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json())

export default function TeamMembersPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: teamId } = use(params)
  const router = useRouter()
  const { data: team, error, mutate } = useSWR(`/api/teams/${teamId}`, fetcher)
  const { data: eventsData } = useSWR('/api/events', fetcher)
  const { data: usersData } = useSWR('/api/users', fetcher)
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
  const groupNumber = team.team_name?.replace('Team ', '') || 'N/A'
  const memberCount = team.team_members?.length || 0
  const createdDate = team.created_at ? new Date(team.created_at).toLocaleDateString() : 'Unknown'
  
  const existingMemberIds = team.team_members?.map((m: any) => m.user_id) || []
  const availableUsers = users.filter((u: any) => 
    !existingMemberIds.includes(u.id) && 
    u.role === 'student' &&
    (u.full_name?.toLowerCase().includes(searchUser.toLowerCase()) || 
     u.email?.toLowerCase().includes(searchUser.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{team.team_name || `Team ${groupNumber}`}</h1>
          <p className="text-muted-foreground mt-1">
            {team.school_name || 'LJ University'} • {event?.name || 'No Event'} • Group {groupNumber}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={handleEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Team
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-gray-600" />
            <p className="text-3xl font-bold">{memberCount}</p>
            <p className="text-sm text-muted-foreground">Members</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Trophy className="h-8 w-8 mx-auto mb-2 text-gray-600" />
            <p className="text-3xl font-bold">{team.total_score || 0}</p>
            <p className="text-sm text-muted-foreground">Score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <MapPin className="h-8 w-8 mx-auto mb-2 text-gray-600" />
            <p className="text-2xl font-bold">{team.stall_no || 'N/A'}</p>
            <p className="text-sm text-muted-foreground">Stall</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <FileText className="h-8 w-8 mx-auto mb-2 text-gray-600" />
            <p className="text-xl font-bold">{team.domain || 'N/A'}</p>
            <p className="text-sm text-muted-foreground">Domain</p>
          </CardContent>
        </Card>
      </div>

      {/* Team Members */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Team Details */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Team Details</CardTitle>
              <Button onClick={handleEdit} variant="ghost" size="sm">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {event && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Event</p>
                <p className="text-base font-medium">{event.name}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Team Name</p>
              <p className="text-lg font-semibold">{team.team_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">School</p>
              <p className="text-base font-medium">{team.school_name || 'LJ University'}</p>
            </div>
            {team.domain && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Domain</p>
                <Badge variant="secondary" className="text-xs">{team.domain}</Badge>
              </div>
            )}
            {team.stall_no && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Stall Location</p>
                <p className="text-base font-medium">{team.stall_no}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-muted-foreground">Team ID</p>
              <p className="text-xs font-mono bg-muted p-2 rounded break-all">{team.id}</p>
            </div>
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Team Members ({memberCount})</CardTitle>
              <Button onClick={() => setShowAddMember(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {memberCount > 0 ? (
              <div className="space-y-3">
                {team.team_members.map((member: any, index: number) => (
                  <div key={member.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0">
                      {member.users?.full_name?.charAt(0) || (index + 1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-base">{member.users?.full_name || 'Unknown Member'}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          <span className="truncate">{member.users?.email || 'No email'}</span>
                        </div>
                        {member.users?.enrollment_number && (
                          <div className="flex items-center gap-1">
                            <Hash className="h-4 w-4" />
                            <span>{member.users.enrollment_number}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant={member.role === 'leader' ? 'default' : 'secondary'}>
                        {member.role || 'Member'}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRemoveMember(member.id)}
                        disabled={loading}
                      >
                        <X className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground mb-2">No members found</p>
                <p className="text-sm text-muted-foreground mb-4">This team doesn't have any members assigned yet.</p>
                <Button onClick={() => setShowAddMember(true)}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add First Member
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
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
              <Button type="submit" disabled={loading} className="flex-1 bg-gray-900 hover:bg-gray-800">
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowEdit(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Member Dialog */}
      <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students by name or email..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="max-h-96 overflow-y-auto space-y-2">
              {availableUsers.length > 0 ? (
                availableUsers.map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold flex-shrink-0">
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
                <div className="text-center py-8 text-muted-foreground">
                  {searchUser ? 'No students found matching your search' : 'No available students to add'}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}