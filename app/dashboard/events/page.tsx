'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Users, Trophy, Clock, MapPin, FileText, Settings, Eye, Plus, X, Search, Grid, List } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRealtime } from '@/components/realtime-provider'

export default function EventsPage() {
  const { events, refreshData } = useRealtime()
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    eventDate: '',
    startTime: '',
    endTime: '',
    venue: '',
    maxTeams: '',
    registrationDeadline: '',
    status: 'draft'
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

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

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          maxTeams: formData.maxTeams ? parseInt(formData.maxTeams) : null
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create event')
      }

      setFormData({ 
        name: '', 
        description: '', 
        eventDate: '', 
        startTime: '', 
        endTime: '', 
        venue: '', 
        maxTeams: '', 
        registrationDeadline: '', 
        status: 'draft' 
      })
      setShowForm(false)
      refreshData()
    } catch (error: any) {
      console.error('Error creating event:', error)
      alert('Failed to create event: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredEvents = events?.filter((event: any) => {
    if (!event) return false
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus
    const matchesSearch = !searchTerm || 
                         event.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.venue?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  }) || []

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  const stats = {
    total: events?.length || 0,
    active: events?.filter(e => e.status === 'active').length || 0,
    completed: events?.filter(e => e.status === 'completed').length || 0,
    totalTeams: events?.reduce((sum, e) => sum + (e.total_teams || 0), 0) || 0
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Events Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Create and manage competition events</p>
        </div>
        {userRole === 'admin' && (
          <Button onClick={() => setShowForm(!showForm)} size="sm" className="w-fit">
            {showForm ? <><X className="h-4 w-4 mr-2" />Cancel</> : <><Plus className="h-4 w-4 mr-2" />Create Event</>}
          </Button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-3 md:p-4 text-center">
            <Calendar className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-primary" />
            <p className="text-xl md:text-2xl font-bold">{stats.total}</p>
            <p className="text-xs md:text-sm text-muted-foreground">Total Events</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4 text-center">
            <Trophy className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-primary" />
            <p className="text-xl md:text-2xl font-bold">{stats.active}</p>
            <p className="text-xs md:text-sm text-muted-foreground">Active Events</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4 text-center">
            <Users className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-primary" />
            <p className="text-xl md:text-2xl font-bold">{stats.totalTeams}</p>
            <p className="text-xs md:text-sm text-muted-foreground">Total Teams</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4 text-center">
            <Clock className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-primary" />
            <p className="text-xl md:text-2xl font-bold">{stats.completed}</p>
            <p className="text-xs md:text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Create Event Form */}
      {showForm && userRole === 'admin' && (
        <Card>
          <CardHeader className="p-3 md:p-4">
            <CardTitle className="text-lg md:text-xl flex items-center gap-2">
              <Plus className="h-4 w-4 md:h-5 md:w-5" />
              Create New Event
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0">
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs md:text-sm">Event Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Science Fair 2024"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="venue" className="text-xs md:text-sm">Venue</Label>
                  <Input
                    id="venue"
                    placeholder="e.g., Main Auditorium"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="text-xs md:text-sm">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Event description and rules"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="eventDate" className="text-xs md:text-sm">Event Date *</Label>
                  <Input
                    id="eventDate"
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startTime" className="text-xs md:text-sm">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime" className="text-xs md:text-sm">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxTeams" className="text-xs md:text-sm">Max Teams</Label>
                  <Input
                    id="maxTeams"
                    type="number"
                    placeholder="Leave empty for unlimited"
                    value={formData.maxTeams}
                    onChange={(e) => setFormData({ ...formData, maxTeams: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registrationDeadline" className="text-xs md:text-sm">Registration Deadline</Label>
                  <Input
                    id="registrationDeadline"
                    type="date"
                    value={formData.registrationDeadline}
                    onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-xs md:text-sm">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" disabled={loading} size="sm">
                  {loading ? 'Creating...' : 'Create Event'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)} size="sm">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="flex flex-col md:flex-row gap-2 md:gap-4 md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <div className="hidden md:flex border rounded-md">
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

      {/* Events Display */}
      {filteredEvents && filteredEvents.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid gap-3 md:gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event: any) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3 p-3 md:p-4">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base md:text-lg truncate">{event.name}</CardTitle>
                    <Badge className={`${getStatusColor(event.status)} text-xs flex-shrink-0`}>
                      {event.status || 'draft'}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                      <span>{new Date(event.event_date).toLocaleDateString()}</span>
                    </div>
                    {event.venue && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 md:h-4 md:w-4" />
                        <span className="truncate">{event.venue}</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-3 md:p-4 pt-0">
                  <div className="space-y-3">
                    {event.description && (
                      <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                        {event.description}
                      </p>
                    )}
                    
                    <div className="grid grid-cols-4 gap-2 p-2 md:p-3 bg-muted rounded-lg">
                      <div className="text-center">
                        <Users className="h-3 w-3 md:h-4 md:w-4 mx-auto mb-1 text-gray-600" />
                        <div className="text-sm md:text-base font-bold">{event.total_teams || 0}</div>
                        <div className="text-xs text-muted-foreground">Teams</div>
                      </div>
                      <div className="text-center">
                        <Trophy className="h-3 w-3 md:h-4 md:w-4 mx-auto mb-1 text-gray-600" />
                        <div className="text-sm md:text-base font-bold">{event.total_judges || 0}</div>
                        <div className="text-xs text-muted-foreground">Judges</div>
                      </div>
                      <div className="text-center">
                        <FileText className="h-3 w-3 md:h-4 md:w-4 mx-auto mb-1 text-gray-600" />
                        <div className="text-sm md:text-base font-bold">{event.total_submissions || 0}</div>
                        <div className="text-xs text-muted-foreground">Subs</div>
                      </div>
                      <div className="text-center">
                        <Clock className="h-3 w-3 md:h-4 md:w-4 mx-auto mb-1 text-gray-600" />
                        <div className="text-sm md:text-base font-bold">{event.completion_rate || 0}%</div>
                        <div className="text-xs text-muted-foreground">Done</div>
                      </div>
                    </div>
                    
                    <div className={`grid gap-2 ${userRole === 'admin' ? 'grid-cols-3' : 'grid-cols-2'}`}>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.location.href = `/dashboard/events/${event.id}`}
                        className="text-xs"
                      >
                        <Eye className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.location.href = `/dashboard/events/${event.id}/teams`}
                        className="text-xs"
                      >
                        <Users className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                        Teams
                      </Button>
                      {userRole === 'admin' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.location.href = `/dashboard/events/${event.id}/edit`}
                          className="text-xs"
                        >
                          <Settings className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredEvents.map((event: any) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <Calendar className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm md:text-base truncate">{event.name}</h3>
                          <Badge className={`${getStatusColor(event.status)} text-xs`}>
                            {event.status || 'draft'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 md:gap-4 mt-1 flex-wrap">
                          <span className="text-xs md:text-sm text-muted-foreground">
                            {new Date(event.event_date).toLocaleDateString()}
                          </span>
                          {event.venue && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {event.venue}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="h-3 w-3" />
                            {event.total_teams || 0} teams
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.location.href = `/dashboard/events/${event.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.location.href = `/dashboard/events/${event.id}/teams`}
                      >
                        <Users className="h-4 w-4" />
                      </Button>
                      {userRole === 'admin' && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.location.href = `/dashboard/events/${event.id}/edit`}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      ) : (
        <Card>
          <CardContent className="p-4 md:pt-6">
            <div className="text-center py-6 md:py-8">
              <Calendar className="h-10 w-10 md:h-12 md:w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm md:text-base text-muted-foreground">
                {searchTerm || filterStatus !== 'all' ? 'No events match your filters' : 'No events found'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
