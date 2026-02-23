'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { UserPlus, X, Users, Search, CheckCircle2, Loader2, Building2, Tag } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface Team {
  id: string
  team_name: string
  event_id: string
  stall_no?: string
  domain?: string
  school_name?: string
}

interface Mentor {
  id: string
  full_name: string
  email: string
}

interface Assignment {
  id: string
  team_id: string
  judge_id: string
  judge: { full_name: string }
}

export default function TeamJudgeAssignment({ eventId }: { eventId: string }) {
  const [teams, setTeams] = useState<Team[]>([])
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [assignments, setAssignments] = useState<Record<string, Assignment[]>>({})
  const [selectedTeam, setSelectedTeam] = useState('')
  const [selectedMentors, setSelectedMentors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    fetchData()
  }, [eventId])

  const fetchData = async () => {
    try {
      const [teamsRes, mentorsRes] = await Promise.all([
        fetch(`/api/teams?event=${eventId}`),
        fetch('/api/mentors')
      ])

      const teamsData = await teamsRes.json()
      const mentorsData = await mentorsRes.json()

      const eventTeams = teamsData.filter((t: Team) => t.event_id === eventId)
      eventTeams.sort((a: Team, b: Team) => {
        const numA = parseInt(a.team_name.match(/\d+/)?.[0] || '0')
        const numB = parseInt(b.team_name.match(/\d+/)?.[0] || '0')
        return numA - numB
      })
      
      setTeams(eventTeams)
      setMentors(mentorsData)

      const assignmentsMap: Record<string, Assignment[]> = {}
      for (const team of eventTeams) {
        const res = await fetch(`/api/teams/${team.id}/judges`)
        const data = await res.json()
        assignmentsMap[team.id] = Array.isArray(data) ? data : []
      }
      setAssignments(assignmentsMap)
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load data', variant: 'destructive', className: 'bg-white' })
    } finally {
      setInitialLoading(false)
    }
  }

  const assignJudge = async () => {
    if (!selectedTeam || selectedMentors.length === 0) {
      toast({ title: 'Error', description: 'Please select team and at least one mentor', variant: 'destructive', className: 'bg-white' })
      return
    }

    // Check for duplicates
    const existingJudgeIds = assignments[selectedTeam]?.map(a => a.judge_id) || []
    const duplicates = selectedMentors.filter(id => existingJudgeIds.includes(id))
    
    if (duplicates.length > 0) {
      const duplicateNames = duplicates.map(id => mentors.find(m => m.id === id)?.full_name).join(', ')
      toast({ 
        title: 'Duplicate Assignment', 
        description: `${duplicateNames} already assigned to this team`, 
        variant: 'destructive', 
        className: 'bg-white' 
      })
      return
    }

    setLoading(true)
    try {
      const results = await Promise.all(
        selectedMentors.map(mentorId =>
          fetch('/api/teams/assign-judge', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ team_id: selectedTeam, judge_id: mentorId, event_id: eventId })
          }).then(res => res.json())
        )
      )

      const newAssignments = selectedMentors.map((mentorId, idx) => {
        const mentor = mentors.find(m => m.id === mentorId)
        return mentor ? { id: results[idx]?.id || `temp-${Date.now()}-${idx}`, judge_id: mentorId, team_id: selectedTeam, ...results[idx], judge: { full_name: mentor.full_name } } : null
      }).filter(Boolean)

      setAssignments(prev => ({
        ...prev,
        [selectedTeam]: [...(prev[selectedTeam] || []), ...newAssignments]
      }))

      toast({ title: 'Success!', description: `${selectedMentors.length} mentor(s) assigned to team`, className: 'bg-white' })
      setSelectedTeam('')
      setSelectedMentors([])
    } catch (error) {
      console.error('Assignment error:', error)
      toast({ title: 'Error', description: 'Network error. Please try again.', variant: 'destructive', className: 'bg-white' })
    } finally {
      setLoading(false)
    }
  }

  const removeJudge = async (assignmentId: string, teamId: string) => {
    try {
      const res = await fetch(`/api/teams/assign-judge?id=${assignmentId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()

      setAssignments(prev => ({
        ...prev,
        [teamId]: prev[teamId].filter(a => a.id !== assignmentId)
      }))

      toast({ title: 'Success', description: 'Mentor removed from team', className: 'bg-white' })
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to remove mentor', variant: 'destructive', className: 'bg-white' })
    }
  }

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.team_name.toLowerCase().includes(searchTerm.toLowerCase())
    const hasAssignments = assignments[team.id]?.length > 0
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'assigned' && hasAssignments) ||
      (filterStatus === 'unassigned' && !hasAssignments)
    return matchesSearch && matchesFilter
  })

  const getTeamStats = () => {
    const totalTeams = teams.length
    const assignedTeams = Object.values(assignments).filter(a => a.length > 0).length
    return { totalTeams, assignedTeams, unassigned: totalTeams - assignedTeams }
  }

  const stats = getTeamStats()

  if (initialLoading) {
    return (
      <div className="space-y-4 md:space-y-6 pb-4 animate-pulse">
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-100 dark:bg-neutral-800 rounded-xl h-28 md:h-36"></div>
          ))}
        </div>
        <div className="bg-gray-100 dark:bg-neutral-800 rounded-xl h-64"></div>
        <div className="bg-gray-100 dark:bg-neutral-800 rounded-xl h-96"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8 pb-6">
      {/* Stats Section */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <Card className="border shadow-sm dark:bg-neutral-900 dark:border-neutral-800">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                <Users className="h-6 w-6 md:h-7 md:w-7 text-gray-700 dark:text-neutral-300" />
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{stats.totalTeams}</p>
                <p className="text-xs md:text-sm text-gray-600 dark:text-neutral-400 font-medium mt-1">Total Teams</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm dark:bg-neutral-900 dark:border-neutral-800">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 md:h-7 md:w-7 text-gray-700 dark:text-neutral-300" />
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{stats.assignedTeams}</p>
                <p className="text-xs md:text-sm text-gray-600 dark:text-neutral-400 font-medium mt-1">Assigned</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm dark:bg-neutral-900 dark:border-neutral-800">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
                <UserPlus className="h-6 w-6 md:h-7 md:w-7 text-gray-700 dark:text-neutral-300" />
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{stats.unassigned}</p>
                <p className="text-xs md:text-sm text-gray-600 dark:text-neutral-400 font-medium mt-1">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignment Form */}
      <Card className="border shadow-sm dark:bg-neutral-900 dark:border-neutral-800">
        <CardHeader className="border-b bg-gray-50 dark:bg-neutral-800 dark:border-neutral-700 p-4 md:p-6">
          <CardTitle className="flex items-center gap-3 text-base md:text-xl dark:text-white">
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center">
              <UserPlus className="h-4 w-4 md:h-5 md:w-5 text-white dark:text-gray-900" />
            </div>
            <span className="font-semibold">Assign Mentors to Team</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900 dark:text-white">Select Team</label>
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger className="h-11 md:h-12 border-2 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white">
                  <SelectValue placeholder="Choose a team" />
                </SelectTrigger>
                <SelectContent className="max-h-[250px] dark:bg-neutral-800 dark:border-neutral-700">
                  {teams.map(team => (
                    <SelectItem key={team.id} value={team.id} className="py-3 dark:text-white dark:focus:bg-neutral-700">
                      <div className="flex items-center justify-between w-full gap-3">
                        <span>{team.team_name}</span>
                        {assignments[team.id]?.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {assignments[team.id].length}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-900 dark:text-white">Add Mentors</label>
              <Select value="" onValueChange={(value) => {
                if (value && !selectedMentors.includes(value)) {
                  setSelectedMentors([...selectedMentors, value])
                }
              }}>
                <SelectTrigger className="h-11 md:h-12 border-2 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white">
                  <SelectValue placeholder="Select mentors" />
                </SelectTrigger>
                <SelectContent className="max-h-[250px] dark:bg-neutral-800 dark:border-neutral-700">
                  {mentors.filter(m => !selectedMentors.includes(m.id)).map(mentor => (
                    <SelectItem key={mentor.id} value={mentor.id} className="py-3 dark:text-white dark:focus:bg-neutral-700">
                      {mentor.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedMentors.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-neutral-800 rounded-lg border dark:border-neutral-700">
                  {selectedMentors.map(mentorId => {
                    const mentor = mentors.find(m => m.id === mentorId)
                    return mentor ? (
                      <Badge key={mentorId} className="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 px-3 py-1.5 flex items-center gap-2">
                        {mentor.full_name}
                        <button onClick={() => setSelectedMentors(selectedMentors.filter(id => id !== mentorId))} className="hover:bg-white/20 rounded-full p-0.5">
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ) : null
                  })}
                </div>
              )}
            </div>
          </div>

          <Button 
            onClick={assignJudge} 
            disabled={!selectedTeam || selectedMentors.length === 0 || loading} 
            className="w-full h-11 md:h-12 font-semibold bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-neutral-100"
          >
            {loading ? (
              <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Assigning...</>
            ) : (
              <><UserPlus className="h-5 w-5 mr-2" />Assign {selectedMentors.length > 0 ? `${selectedMentors.length} Mentor${selectedMentors.length > 1 ? 's' : ''}` : 'Mentors'}</>  
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Teams Grid */}
      <Card className="border shadow-sm dark:bg-neutral-900 dark:border-neutral-800">
        <CardHeader className="border-b bg-gray-50 dark:bg-neutral-800 dark:border-neutral-700 p-4 md:p-6">
          <div className="space-y-3">
            <CardTitle className="flex items-center gap-3 text-base md:text-xl dark:text-white">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-gray-900 dark:bg-white flex items-center justify-center">
                <Users className="h-4 w-4 md:h-5 md:w-5 text-white dark:text-gray-900" />
              </div>
              <span className="font-semibold">Teams & Assignments</span>
            </CardTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-neutral-500" />
                <Input
                  placeholder="Search teams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11 border-2 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white"
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-11 border-2 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="dark:bg-neutral-800 dark:border-neutral-700">
                  <SelectItem value="all" className="dark:text-white dark:focus:bg-neutral-700">All Teams</SelectItem>
                  <SelectItem value="assigned" className="dark:text-white dark:focus:bg-neutral-700">Assigned</SelectItem>
                  <SelectItem value="unassigned" className="dark:text-white dark:focus:bg-neutral-700">Unassigned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredTeams.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Users className="h-16 w-16 mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">No teams found</p>
              </div>
            ) : (
              filteredTeams.map(team => (
                <Card key={team.id} className="border-2 hover:border-gray-400 dark:hover:border-neutral-600 hover:shadow-md transition-all dark:bg-neutral-800 dark:border-neutral-700">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm md:text-base mb-2 line-clamp-2 dark:text-white">
                            {team.team_name}
                          </h3>
                          <div className="flex flex-wrap gap-1.5">
                            {team.stall_no && (
                              <Badge variant="outline" className="text-xs">
                                <Building2 className="h-3 w-3 mr-1" />
                                {team.stall_no}
                              </Badge>
                            )}
                            {team.domain && (
                              <Badge variant="outline" className="text-xs">
                                <Tag className="h-3 w-3 mr-1" />
                                {team.domain}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {assignments[team.id]?.length === 0 ? (
                          <Badge variant="outline" className="text-xs flex-shrink-0">
                            Unassigned
                          </Badge>
                        ) : assignments[team.id]?.length > 0 ? (
                          <Badge className="bg-gray-900 dark:bg-white dark:text-gray-900 text-xs flex-shrink-0">
                            {assignments[team.id].length}
                          </Badge>
                        ) : null}
                      </div>

                      <div className="space-y-2 min-h-[70px]">
                        {assignments[team.id]?.length > 0 ? (
                          <div className="space-y-1.5">
                            {assignments[team.id].map(assignment => (
                              <div key={assignment.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-gray-50 dark:bg-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-600 transition-colors group">
                                <span className="text-xs md:text-sm font-medium truncate flex-1 dark:text-white">{assignment.judge.full_name}</span>
                                <button
                                  onClick={() => removeJudge(assignment.id, team.id)}
                                  className="opacity-0 group-hover:opacity-100 hover:bg-red-100 text-red-600 rounded-full p-1 transition-all"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-16 border-2 border-dashed rounded-lg dark:border-neutral-600">
                            <span className="text-xs text-gray-400 dark:text-neutral-500">No mentors assigned</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
