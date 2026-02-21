'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Users, Search, Grid, List, MapPin, Trophy, Calendar } from 'lucide-react'
import { useState } from 'react'
import { useRealtime } from '@/components/realtime-provider'

export default function TeamsPage() {
  const { teams, events } = useRealtime()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDomain, setFilterDomain] = useState('all')
  const [filterEvent, setFilterEvent] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const filteredTeams = Array.isArray(teams) ? teams.filter((team: any) => {
    const matchesSearch = team.team_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         team.school_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDomain = filterDomain === 'all' || team.domain === filterDomain
    const matchesEvent = filterEvent === 'all' || team.event_id === filterEvent
    return matchesSearch && matchesDomain && matchesEvent
  }).sort((a: any, b: any) => {
    // Sort by event name, then by team name
    const eventA = events?.find((e: any) => e.id === a.event_id)?.name || ''
    const eventB = events?.find((e: any) => e.id === b.event_id)?.name || ''
    if (eventA !== eventB) return eventA.localeCompare(eventB)
    return (a.team_name || '').localeCompare(b.team_name || '')
  }) : []

  const domains = Array.isArray(teams) ? [...new Set(teams.map((team: any) => team.domain).filter(Boolean))] : []
  
  // Group teams by event
  const teamsByEvent = filteredTeams.reduce((acc: any, team: any) => {
    const eventId = team.event_id || 'no-event'
    if (!acc[eventId]) acc[eventId] = []
    acc[eventId].push(team)
    return acc
  }, {})

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Teams Management</h1>
        <p className="text-sm text-muted-foreground mt-1">View and manage team information</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-3 md:p-4 text-center">
            <Users className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-primary" />
            <p className="text-xl md:text-2xl font-bold">{Array.isArray(teams) ? teams.length : 0}</p>
            <p className="text-xs md:text-sm text-muted-foreground">Total Teams</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4 text-center">
            <Trophy className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-primary" />
            <p className="text-xl md:text-2xl font-bold">{Array.isArray(teams) && teams.length ? Math.max(...teams.map((team: any) => team.total_score || 0)) : 0}</p>
            <p className="text-xs md:text-sm text-muted-foreground">Top Score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4 text-center">
            <MapPin className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-primary" />
            <p className="text-xl md:text-2xl font-bold">{domains.length}</p>
            <p className="text-xs md:text-sm text-muted-foreground">Domains</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4 text-center">
            <Calendar className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-primary" />
            <p className="text-xl md:text-2xl font-bold">{Array.isArray(teams) && teams.length ? (teams.reduce((sum: number, team: any) => sum + (team.total_score || 0), 0) / teams.length).toFixed(0) : 0}</p>
            <p className="text-xs md:text-sm text-muted-foreground">Avg Score</p>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="flex flex-col md:flex-row gap-2 md:gap-4 md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterEvent} onValueChange={setFilterEvent}>
                <SelectTrigger className="w-full md:w-48">
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
              <Select value={filterDomain} onValueChange={setFilterDomain}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by domain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Domains</SelectItem>
                  {domains.map((domain: string) => (
                    <SelectItem key={domain} value={domain}>
                      {domain}
                    </SelectItem>
                  ))}
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

      {/* Teams Display - Grouped by Event */}
      {filteredTeams && filteredTeams.length > 0 ? (
        <div className="space-y-6">
          {Object.entries(teamsByEvent).map(([eventId, eventTeams]: [string, any]) => {
            const event = events?.find((e: any) => e.id === eventId)
            const eventName = event?.name || 'No Event Assigned'
            
            return (
              <div key={eventId} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-600" />
                  <h2 className="text-xl font-semibold text-gray-900">{eventName}</h2>
                  <Badge variant="outline" className="text-gray-600">
                    {eventTeams.length} {eventTeams.length === 1 ? 'team' : 'teams'}
                  </Badge>
                </div>
                
                {viewMode === 'grid' ? (
          <div className="grid gap-3 md:gap-4 md:grid-cols-2 lg:grid-cols-3">
            {eventTeams.map((team: any) => (
              <Card key={team.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = `/dashboard/teams/${team.id}/members`}>
                <CardHeader className="p-3 md:p-4">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <CardTitle className="text-base md:text-lg truncate">{team.team_name}</CardTitle>
                      <CardDescription className="text-xs md:text-sm truncate">{team.school_name}</CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs ml-2 flex-shrink-0">{team.total_score || 0}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-3 md:p-4 pt-0">
                  <div className="space-y-2">
                    {team.domain && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Domain:</span>
                        <Badge variant="secondary" className="text-xs">{team.domain}</Badge>
                      </div>
                    )}
                    {team.stall_no && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                        <span className="text-xs md:text-sm">{team.stall_no}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Users className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                      <span className="text-xs md:text-sm">{team.team_size || 0} members</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {eventTeams.map((team: any) => (
              <Card key={team.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => window.location.href = `/dashboard/teams/${team.id}/members`}>
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm md:text-base flex-shrink-0">
                        {team.team_name?.replace('Team ', '') || '?'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-sm md:text-base truncate">{team.team_name}</h3>
                        <p className="text-xs md:text-sm text-muted-foreground truncate">{team.school_name}</p>
                        <div className="flex items-center gap-2 md:gap-4 mt-1 flex-wrap">
                          {team.domain && <Badge variant="secondary" className="text-xs">{team.domain}</Badge>}
                          {team.stall_no && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {team.stall_no}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="h-3 w-3" />
                            {team.team_size || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-lg md:text-xl font-bold">{team.total_score || 0}</div>
                      <div className="text-xs text-muted-foreground">Score</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
                }
              </div>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-4 md:pt-6">
            <div className="text-center py-6 md:py-8">
              <Users className="h-10 w-10 md:h-12 md:w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm md:text-base text-muted-foreground">
                {searchTerm || filterDomain !== 'all' ? 'No teams match your filters' : 'No teams found'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}