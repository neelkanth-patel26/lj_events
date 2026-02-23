'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Users, Calendar, Trophy, MapPin, Mail, Phone, User, ChevronDown, ChevronUp } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function MyTeamsPage() {
  const [userTeams, setUserTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [collapsedEvents, setCollapsedEvents] = useState<Set<string>>(new Set())
  const [selectedEvent, setSelectedEvent] = useState('all')

  useEffect(() => {
    const fetchMyTeams = async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          const { data: teamMembers } = await supabase
            .from('team_members')
            .select('team_id, teams(*, events(*))')
            .eq('user_id', user.id)
          
          if (teamMembers && teamMembers.length > 0) {
            const teamsWithMembers = await Promise.all(
              teamMembers.map(async (tm: any) => {
                const { data: members } = await supabase
                  .from('team_members')
                  .select('id, role, user_id, users(id, full_name, email, enrollment_number)')
                  .eq('team_id', tm.team_id)
                
                return { ...tm.teams, members: members || [], event: tm.teams.events }
              })
            )
            
            setUserTeams(teamsWithMembers)
          }
        }
      } catch (error) {
        console.error('Error fetching teams:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchMyTeams()
  }, [])

  const toggleEventCollapse = (eventId: string) => {
    setCollapsedEvents(prev => {
      const newSet = new Set(prev)
      if (newSet.has(eventId)) {
        newSet.delete(eventId)
      } else {
        newSet.add(eventId)
      }
      return newSet
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your teams...</p>
        </div>
      </div>
    )
  }

  if (userTeams.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Teams</h1>
          <p className="text-sm text-muted-foreground mt-1">View your team information and members</p>
        </div>
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">You are not part of any team yet</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const teamsByEvent = userTeams.reduce((acc: any, team: any) => {
    const eventId = team.event_id
    if (!acc[eventId]) {
      acc[eventId] = {
        event: team.event,
        teams: []
      }
    }
    acc[eventId].teams.push(team)
    return acc
  }, {})

  const filteredTeamsByEvent = selectedEvent === 'all' 
    ? teamsByEvent 
    : { [selectedEvent]: teamsByEvent[selectedEvent] }

  const allEvents = Object.values(teamsByEvent).map((data: any) => data.event).filter(Boolean)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Teams</h1>
          <p className="text-sm text-muted-foreground mt-1">View your team information and members</p>
        </div>
        <Select value={selectedEvent} onValueChange={setSelectedEvent}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Filter by event" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Events</SelectItem>
            {allEvents.map((event: any) => (
              <SelectItem key={event.id} value={event.id}>
                {event.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{Object.keys(teamsByEvent).length}</p>
            <p className="text-xs text-muted-foreground">Events</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{userTeams.length}</p>
            <p className="text-xs text-muted-foreground">Teams</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{userTeams.reduce((sum, t) => sum + (t.total_score || 0), 0)}</p>
            <p className="text-xs text-muted-foreground">Total Score</p>
          </CardContent>
        </Card>
      </div>

      {Object.entries(filteredTeamsByEvent).map(([eventId, eventData]: [string, any]) => (
        <div key={eventId} className="space-y-4">
          <div 
            className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors"
            onClick={() => toggleEventCollapse(eventId)}
          >
            {collapsedEvents.has(eventId) ? 
              <ChevronDown className="h-5 w-5 text-gray-600" /> : 
              <ChevronUp className="h-5 w-5 text-gray-600" />
            }
            <Calendar className="h-5 w-5 text-gray-600" />
            <div>
              <h2 className="text-xl font-semibold">{eventData.event?.name || 'Unknown Event'}</h2>
              <p className="text-sm text-muted-foreground">
                {eventData.event?.event_date && new Date(eventData.event.event_date).toLocaleDateString()}
                {eventData.event?.venue && ` • ${eventData.event.venue}`}
              </p>
            </div>
            <Badge variant={eventData.event?.status === 'active' ? 'default' : 'secondary'} className="ml-auto">
              {eventData.event?.status || 'draft'}
            </Badge>
          </div>

          {!collapsedEvents.has(eventId) && eventData.teams.map((team: any) => (
            <Card key={team.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{team.team_name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">{team.school_name}</p>
                  </div>
                  <Badge variant="outline" className="text-lg font-bold">
                    {team.total_score || 0} pts
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {team.domain && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Domain:</span>
                      <Badge variant="secondary">{team.domain}</Badge>
                    </div>
                  )}
                  {team.stall_no && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{team.stall_no}</span>
                    </div>
                  )}
                  {team.contact_email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm truncate">{team.contact_email}</span>
                    </div>
                  )}
                  {team.contact_phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{team.contact_phone}</span>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Team Members ({team.members?.length || 0})
                  </h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    {team.members?.map((member: any) => (
                      <div key={member.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium truncate">{member.users?.full_name || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground truncate">{member.users?.email}</p>
                          {member.users?.enrollment_number && (
                            <p className="text-xs text-muted-foreground">{member.users.enrollment_number}</p>
                          )}
                        </div>
                        {member.role !== 'member' && (
                          <Badge variant="outline" className="text-xs">{member.role}</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ))}
    </div>
  )
}
