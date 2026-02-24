'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { useState, use, useEffect } from 'react'
import { ArrowLeft, Plus, Users, Trophy, School, X, Pencil, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json())

export default function ManageTeamsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = use(params)
  const router = useRouter()
  const { data, mutate, isLoading } = useSWR(`/api/events/${eventId}/teams`, fetcher)
  const teams = data?.teams
  const isLeaderboardVisible = data?.leaderboard_visible
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [editingTeam, setEditingTeam] = useState<any>(null)
  const [deletingTeam, setDeletingTeam] = useState<any>(null)
  const [formData, setFormData] = useState({
    teamName: '',
    schoolName: '',
  })

  useEffect(() => {
    const checkRole = async () => {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()
        setUserRole(data?.role || null)
      } catch (error) {
        console.error('Error fetching role:', error)
        setUserRole(null)
      }
    }
    checkRole()
  }, [])

const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/events/${eventId}/teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, eventId }),
      })

      if (!response.ok) throw new Error('Failed to create team')

      setFormData({ teamName: '', schoolName: '' })
      setShowForm(false)
      mutate()
    } catch (error) {
      console.error('Error creating team:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTeam) return
    setLoading(true)

    try {
      const response = await fetch(`/api/teams/${editingTeam.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          team_name: formData.teamName,
          school_name: formData.schoolName,
        }),
      })

      if (!response.ok) throw new Error('Failed to update team')

      setEditingTeam(null)
      setFormData({ teamName: '', schoolName: '' })
      mutate()
    } catch (error) {
      console.error('Error updating team:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTeam = async () => {
    if (!deletingTeam) return
    
    setLoading(true)
    try {
      const response = await fetch(`/api/teams/${deletingTeam.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete team')
      setDeletingTeam(null)
      mutate()
    } catch (error) {
      console.error('Error deleting team:', error)
      alert('Failed to delete team')
    } finally {
      setLoading(false)
    }
  }

  if (isLoading || !userRole) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading teams...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold dark:text-white">Manage Teams</h1>
          <p className="text-sm text-muted-foreground mt-1">{teams?.length || 0} Teams Registered</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()} size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          {userRole === 'admin' && (
            <Button onClick={() => setShowForm(!showForm)} size="sm">
              {showForm ? (
                <><X className="h-4 w-4 mr-2" />Cancel</>
              ) : (
                <><Plus className="h-4 w-4 mr-2" />Add Team</>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Add Team Form - Admin Only */}
      {showForm && userRole === 'admin' && (
        <Card className="dark:bg-neutral-900 dark:border-neutral-800">
          <CardHeader className="p-3 md:p-4">
            <CardTitle className="text-lg md:text-xl flex items-center gap-2 dark:text-white">
              <Plus className="h-4 w-4 md:h-5 md:w-5" />
              Add New Team
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0">
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="teamName" className="text-xs md:text-sm">
                    Team Name *
                  </Label>
                  <Input
                    id="teamName"
                    value={formData.teamName}
                    onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                    placeholder="Enter team name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schoolName" className="text-xs md:text-sm">
                    School Name
                  </Label>
                  <Input
                    id="schoolName"
                    value={formData.schoolName}
                    onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                    placeholder="Enter school name"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading} size="sm">
                  {loading ? 'Creating...' : 'Create Team'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} size="sm">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Teams Grid */}
      {teams && teams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {teams.map((team: any) => (
            <Card key={team.id} className="hover:shadow-md transition-shadow dark:bg-neutral-900 dark:border-neutral-800">
              <CardHeader className="pb-3 p-3 md:p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0 flex-1">
                    <CardTitle className="text-base md:text-lg truncate dark:text-white">{team.team_name}</CardTitle>
                    {team.school_name && (
                      <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                        <School className="h-3 w-3 md:h-4 md:w-4" />
                        <span className="truncate">{team.school_name}</span>
                      </div>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    {team.id.slice(0, 6)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-3 md:p-4 pt-0">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                      <span className="text-xs md:text-sm font-medium">Score</span>
                    </div>
                    <span className="text-base md:text-lg font-bold">
                      {(userRole === 'admin' || isLeaderboardVisible) ? (team.total_score || 0) : '***'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                      <span className="text-xs md:text-sm font-medium">Members</span>
                    </div>
                    <span className="text-xs md:text-sm text-muted-foreground">
                      {team.member_count || 0}
                    </span>
                  </div>
                  
                  <div className="pt-2 border-t flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-xs md:text-sm"
                      onClick={() => router.push(`/dashboard/teams/${team.id}/members`)}
                    >
                      View
                    </Button>
                    {userRole === 'admin' && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 text-xs md:text-sm"
                          onClick={() => {
                            setEditingTeam(team)
                            setFormData({ teamName: team.team_name, schoolName: team.school_name || '' })
                          }}
                        >
                          <Pencil className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="text-xs md:text-sm px-2"
                          onClick={() => setDeletingTeam(team)}
                          disabled={loading}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="dark:bg-neutral-900 dark:border-neutral-800">
          <CardContent className="p-6 md:py-12">
            <div className="text-center">
              <Users className="h-10 w-10 md:h-12 md:w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-base md:text-lg font-medium dark:text-white mb-2">No teams registered yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Get started by adding the first team to this event.</p>
              {userRole === 'admin' && (
                <Button onClick={() => setShowForm(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Team
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Edit Team Dialog */}
      <Dialog open={!!editingTeam} onOpenChange={(open) => !open && setEditingTeam(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditTeam} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-teamName">Team Name *</Label>
              <Input
                id="edit-teamName"
                value={formData.teamName}
                onChange={(e) => setFormData({ ...formData, teamName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-schoolName">School Name</Label>
              <Input
                id="edit-schoolName"
                value={formData.schoolName}
                onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditingTeam(null)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Team Confirmation Dialog */}
      <Dialog open={!!deletingTeam} onOpenChange={(open) => !open && setDeletingTeam(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Team</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deletingTeam?.team_name}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingTeam(null)} disabled={loading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteTeam} disabled={loading}>
              {loading ? 'Deleting...' : 'Delete Team'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}