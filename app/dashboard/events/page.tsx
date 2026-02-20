'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Users, Trophy, Clock, MapPin, FileText, Settings, Eye, Plus, X, Search, Filter } from 'lucide-react'
import { useState } from 'react'
import { useRealtime } from '@/components/realtime-provider'

export default function EventsPage() {
  const { events, refreshData } = useRealtime()
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
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
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

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
    const matchesFilter = filter === 'all' || event.status === filter
    const matchesSearch = !searchTerm || 
                         event.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  }) || []

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  const getEventStats = (event: any) => {
    return {
      teams: event.total_teams || 0,
      maxTeams: event.max_teams || 'Unlimited',
      daysLeft: event.event_date ? Math.ceil((new Date(event.event_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Events Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Create and manage competition events</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} size="sm" className="w-fit">
          {showForm ? (
            <><X className="h-4 w-4 mr-2" />Cancel</>
          ) : (
            <><Plus className="h-4 w-4 mr-2" />Create Event</>
          )}
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-3 md:p-4 text-center">
            <Calendar className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-primary" />
            <p className="text-xl md:text-2xl font-bold">{events?.length || 0}</p>
            <p className="text-xs md:text-sm text-muted-foreground">Total Events</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4 text-center">
            <Trophy className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-primary" />
            <p className="text-xl md:text-2xl font-bold">{events?.filter(e => e.status === 'active').length || 0}</p>
            <p className="text-xs md:text-sm text-muted-foreground">Active Events</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4 text-center">
            <Users className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-primary" />
            <p className="text-xl md:text-2xl font-bold">{events?.reduce((sum, e) => sum + (e.total_teams || 0), 0) || 0}</p>
            <p className="text-xs md:text-sm text-muted-foreground">Total Teams</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4 text-center">
            <Clock className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-primary" />
            <p className="text-xl md:text-2xl font-bold">{events?.filter(e => e.status === 'draft').length || 0}</p>
            <p className="text-xs md:text-sm text-muted-foreground">Draft Events</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Create Event Form */}
      {showForm && (
        <Card>
          <CardHeader className="p-3 md:p-4">
            <CardTitle className="text-lg md:text-xl flex items-center gap-2">
              <Plus className="h-4 w-4 md:h-5 md:w-5" />
              Create New Event
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0">
            <form onSubmit={handleCreateEvent} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  rows={4}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status" className="text-xs md:text-sm">Initial Status</Label>
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
              
              <div className="flex gap-3">
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

      {/* Events Grid */}
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900">Events</h2>
          {filteredEvents.length > 0 && (
            <Badge variant="outline" className="text-gray-600 text-xs">
              {filteredEvents.length} of {events?.length || 0}
            </Badge>
          )}
        </div>

        {filteredEvents && filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {filteredEvents.map((event: any) => {
              const stats = getEventStats(event)
              return (
                <Card key={event.id} className="border-gray-200 hover:shadow-lg transition-all duration-200">
                  <CardHeader className="pb-3 p-3 md:p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardTitle className="text-base md:text-lg text-gray-900 truncate">{event.name}</CardTitle>
                          <Badge className={`${getStatusColor(event.status)} text-xs`}>
                            {event.status || 'draft'}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 md:h-4 md:w-4" />
                            <span className="hidden sm:inline">{new Date(event.event_date).toLocaleDateString()}</span>
                            <span className="sm:hidden">{new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </div>
                          {event.venue && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 md:h-4 md:w-4" />
                              <span className="truncate max-w-[100px] md:max-w-none">{event.venue}</span>
                            </div>
                          )}
                          {stats.daysLeft > 0 && (
                            <div className="flex items-center gap-1 text-orange-600">
                              <Clock className="h-3 w-3 md:h-4 md:w-4" />
                              {stats.daysLeft}d
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 md:p-4 pt-0">
                    <div className="space-y-3 md:space-y-4">
                      {event.description && (
                        <p className="text-xs md:text-sm text-gray-600 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                      
                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-2 md:gap-4 p-3 md:p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="bg-blue-50 p-1.5 md:p-2 rounded-lg">
                            <Users className="h-3 w-3 md:h-4 md:w-4 text-blue-600" />
                          </div>
                          <div>
                            <div className="text-base md:text-lg font-bold text-gray-900">{stats.teams}</div>
                            <div className="text-xs text-gray-600">Teams</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="bg-green-50 p-1.5 md:p-2 rounded-lg">
                            <Trophy className="h-3 w-3 md:h-4 md:w-4 text-green-600" />
                          </div>
                          <div>
                            <div className="text-base md:text-lg font-bold text-gray-900">{event.total_judges || 0}</div>
                            <div className="text-xs text-gray-600">Judges</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="bg-purple-50 p-1.5 md:p-2 rounded-lg">
                            <FileText className="h-3 w-3 md:h-4 md:w-4 text-purple-600" />
                          </div>
                          <div>
                            <div className="text-base md:text-lg font-bold text-gray-900">{event.total_submissions || 0}</div>
                            <div className="text-xs text-gray-600">Submissions</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="bg-orange-50 p-1.5 md:p-2 rounded-lg">
                            <Clock className="h-3 w-3 md:h-4 md:w-4 text-orange-600" />
                          </div>
                          <div>
                            <div className="text-base md:text-lg font-bold text-gray-900">{event.completion_rate || 0}%</div>
                            <div className="text-xs text-gray-600">Complete</div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.location.href = `/dashboard/events/${event.id}`}
                          className="flex-1 min-w-0 text-xs md:text-sm"
                        >
                          <Eye className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.location.href = `/dashboard/events/${event.id}/teams`}
                          className="flex-1 min-w-0 text-xs md:text-sm"
                        >
                          <Users className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                          Teams
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.location.href = `/dashboard/events/${event.id}/edit`}
                          className="flex-1 min-w-0 text-xs md:text-sm"
                        >
                          <Settings className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          }
          </div>
        ) : (
          <Card className="border-gray-200">
            <CardContent className="py-12">
              <div className="text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || filter !== 'all' ? 'No events match your filters' : 'No events created yet'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm || filter !== 'all' 
                    ? 'Try adjusting your search or filter criteria' 
                    : 'Get started by creating your first event'}
                </p>
                {(!searchTerm && filter === 'all') ? (
                  <Button onClick={() => setShowForm(true)} className="bg-gray-900 hover:bg-gray-800">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Event
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    onClick={() => { setSearchTerm(''); setFilter('all') }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}