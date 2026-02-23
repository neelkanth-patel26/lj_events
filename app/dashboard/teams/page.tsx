'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Users, Search, MapPin, Trophy, Plus, ChevronDown } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRealtime } from '@/components/realtime-provider'

export default function TeamsPage() {
  const { teams, events } = useRealtime()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterEvent, setFilterEvent] = useState('all')
  const [userRole, setUserRole] = useState<string | null>(null)
  const [teamMembers, setTeamMembers] = useState<Record<string, any[]>>({})
  const [collapsedEvents, setCollapsedEvents] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [eventLeaderboardStatus, setEventLeaderboardStatus] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()
        setUserRole(data?.role || 'admin')
      } catch (error) {
        setUserRole('admin')
      }
    }
    fetchRole()
  }, [])

  useEffect(() => {
    const fetchMembers = async () => {
      if (!teams || teams.length === 0) return
      setLoading(true)
      const membersMap: Record<string, any[]> = {}
      for (const team of teams) {
        try {
          const res = await fetch(`/api/teams/${team.id}/members`)
          const data = await res.json()
          membersMap[team.id] = data || []
        } catch {
          membersMap[team.id] = []
        }
      }
      setTeamMembers(membersMap)
      setLoading(false)
    }
    fetchMembers()
  }, [teams])

  useEffect(() => {
    if (events && events.length > 0) {
      const statusMap: Record<string, boolean> = {}
      events.forEach((event: any) => {
        statusMap[event.id] = event.leaderboard_visible || false
      })
      setEventLeaderboardStatus(statusMap)
    }
  }, [events])

  const filteredTeams = Array.isArray(teams) ? teams.filter((team: any) => {
    const matchesSearch = team.team_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEvent = filterEvent === 'all' || team.event_id === filterEvent
    return matchesSearch && matchesEvent
  }).sort((a: any, b: any) => {
    const numA = parseInt(a.team_name.match(/\d+/)?.[0] || '0')
    const numB = parseInt(b.team_name.match(/\d+/)?.[0] || '0')
    return numA - numB
  }) : []

  const teamsByEvent = filteredTeams.reduce((acc: any, team: any) => {
    const eventId = team.event_id || 'no-event'
    if (!acc[eventId]) acc[eventId] = []
    acc[eventId].push(team)
    return acc
  }, {})

  const renderTeamCard = (team: any) => {
    const isLeaderboardLocked = (userRole === 'student' || userRole === 'mentor') && !eventLeaderboardStatus[team.event_id]
    return (
    <Card 
      key={team.id} 
      className="border-2 hover:border-gray-400 dark:hover:border-gray-600 hover:shadow-lg transition-all cursor-pointer dark:bg-neutral-900 dark:border-neutral-800"
      onClick={() => window.location.href = `/dashboard/teams/${team.id}/members`}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base mb-1 line-clamp-2 dark:text-white">{team.team_name}</h3>
              <div className="flex flex-wrap gap-1.5">
                {team.stall_no && (
                  <Badge variant="outline" className="text-xs">
                    Stall {team.stall_no}
                  </Badge>
                )}
                {team.domain && (
                  <Badge variant="secondary" className="text-xs">
                    {team.domain}
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-xl font-bold dark:text-white">{isLeaderboardLocked ? '***' : (team.total_score || 0)}</div>
              <div className="text-xs text-muted-foreground">Score</div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>{teamMembers[team.id]?.length || 0} Members</span>
          </div>
          {teamMembers[team.id] && teamMembers[team.id].length > 0 && (
            <div className="pt-2 border-t dark:border-neutral-800 space-y-1.5">
              {teamMembers[team.id].map((member: any, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{member.users?.full_name?.charAt(0) || 'M'}</span>
                  </div>
                  <p className="text-xs font-medium truncate dark:text-gray-300">{member.users?.full_name || 'Member'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )}

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Teams</h1>
          <p className="text-sm text-muted-foreground">View and manage teams</p>
        </div>
        {userRole === 'admin' && (
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <Card className="border shadow-sm dark:bg-neutral-900 dark:border-neutral-800">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
              <Users className="h-5 w-5 md:h-6 md:w-6 text-gray-700 dark:text-gray-300" />
            </div>
            <p className="text-xl md:text-2xl font-bold dark:text-white">{filteredTeams.length}</p>
            <p className="text-xs md:text-sm text-muted-foreground">Teams</p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm dark:bg-neutral-900 dark:border-neutral-800">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
              <Trophy className="h-5 w-5 md:h-6 md:w-6 text-gray-700 dark:text-gray-300" />
            </div>
            <p className="text-xl md:text-2xl font-bold dark:text-white">
              {(userRole === 'student' || userRole === 'mentor') && (filterEvent === 'all' || !eventLeaderboardStatus[filterEvent])
                ? '***' 
                : filteredTeams.length ? Math.max(...filteredTeams.map((t: any) => t.total_score || 0)) : 0}
            </p>
            <p className="text-xs md:text-sm text-muted-foreground">Top Score</p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm dark:bg-neutral-900 dark:border-neutral-800">
          <CardContent className="p-4 text-center">
            <div className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
              <MapPin className="h-5 w-5 md:h-6 md:w-6 text-gray-700 dark:text-gray-300" />
            </div>
            <p className="text-xl md:text-2xl font-bold dark:text-white">
              {(userRole === 'student' || userRole === 'mentor') && (filterEvent === 'all' || !eventLeaderboardStatus[filterEvent])
                ? '***'
                : filteredTeams.length ? Math.round(filteredTeams.reduce((sum: number, t: any) => sum + (t.total_score || 0), 0) / filteredTeams.length) : 0}
            </p>
            <p className="text-xs md:text-sm text-muted-foreground">Avg Score</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border shadow-sm dark:bg-neutral-900 dark:border-neutral-800">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-11"
              />
            </div>
            <Select value={filterEvent} onValueChange={setFilterEvent}>
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Filter by event" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                {Array.isArray(events) && events.map((event: any) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="border-2 dark:bg-neutral-900 dark:border-neutral-800">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-gray-200 dark:bg-neutral-800 rounded w-3/4 animate-pulse"></div>
                      <div className="flex gap-2">
                        <div className="h-5 bg-gray-200 dark:bg-neutral-800 rounded w-16 animate-pulse" style={{animationDelay: '0.1s'}}></div>
                        <div className="h-5 bg-gray-200 dark:bg-neutral-800 rounded w-20 animate-pulse" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="h-6 bg-gray-200 dark:bg-neutral-800 rounded w-12 animate-pulse" style={{animationDelay: '0.15s'}}></div>
                      <div className="h-3 bg-gray-200 dark:bg-neutral-800 rounded w-12 animate-pulse" style={{animationDelay: '0.25s'}}></div>
                    </div>
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-24 animate-pulse" style={{animationDelay: '0.3s'}}></div>
                  <div className="pt-2 border-t dark:border-neutral-800 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 bg-gray-200 dark:bg-neutral-800 rounded-full animate-pulse" style={{animationDelay: '0.35s'}}></div>
                      <div className="h-3 bg-gray-200 dark:bg-neutral-800 rounded w-32 animate-pulse" style={{animationDelay: '0.4s'}}></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 bg-gray-200 dark:bg-neutral-800 rounded-full animate-pulse" style={{animationDelay: '0.45s'}}></div>
                      <div className="h-3 bg-gray-200 dark:bg-neutral-800 rounded w-28 animate-pulse" style={{animationDelay: '0.5s'}}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTeams.length > 0 ? (
        filterEvent === 'all' ? (
          <div className="space-y-6">
            {Object.entries(teamsByEvent).map(([eventId, eventTeams]: [string, any]) => {
              const event = events?.find((e: any) => e.id === eventId)
              const isCollapsed = collapsedEvents.has(eventId)
              return (
                <div key={eventId} className="space-y-4">
                  <div 
                    className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity"
                    onClick={() => {
                      setCollapsedEvents(prev => {
                        const next = new Set(prev)
                        if (next.has(eventId)) next.delete(eventId)
                        else next.add(eventId)
                        return next
                      })
                    }}
                  >
                    <ChevronDown className={`h-5 w-5 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
                    <h2 className="text-lg font-semibold dark:text-white">{event?.name || 'No Event'}</h2>
                    <Badge variant="outline">{eventTeams.length}</Badge>
                  </div>
                  {!isCollapsed && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {eventTeams.map(renderTeamCard)}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTeams.map(renderTeamCard)}
          </div>
        )
      ) : (
        <Card className="dark:bg-neutral-900 dark:border-neutral-800">
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground">No teams found</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
