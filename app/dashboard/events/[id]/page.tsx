'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calendar, Users, Trophy, Clock, MapPin, Settings, ArrowLeft, FileText, Target, AlertCircle, CheckCircle2, Lock, Unlock } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import useSWR from 'swr'
import { useCallback, useEffect, useState } from 'react'
import { useRealtimeData } from '@/hooks/useRealtimeData'

const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json())

export default function EventDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id
  const [userRole, setUserRole] = useState<string | null>(null)

  const { data: event, isLoading, mutate } = useSWR(`/api/events/${eventId}`, fetcher)
  
  useEffect(() => {
    const checkRole = async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data } = await supabase.from('users').select('role').eq('id', user.id).single()
          setUserRole(data?.role || null)
        }
      } catch (error) {
        console.error('Error fetching role:', error)
        setUserRole(null)
      }
    }
    checkRole()
  }, [])
  
  const handleDataChange = useCallback(() => {
    mutate()
  }, [mutate])
  
  useRealtimeData(handleDataChange, ['events', 'teams'])

  const toggleLeaderboard = async () => {
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leaderboard_visible: !event.leaderboard_visible })
      })
      if (res.ok) {
        mutate()
      }
    } catch (error) {
      console.error('Error toggling leaderboard:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading event details...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-medium">Event not found</p>
          <p className="text-muted-foreground mb-4">The event you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/dashboard/events')}>
            Back to Events
          </Button>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200'
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'upcoming': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return <CheckCircle2 className="h-3 w-3" />
      case 'completed': return <Trophy className="h-3 w-3" />
      case 'archived': return <FileText className="h-3 w-3" />
      default: return <Clock className="h-3 w-3" />
    }
  }

  const eventDate = event.event_date ? new Date(event.event_date) : null
  const registrationDeadline = event.registration_deadline ? new Date(event.registration_deadline) : null
  const daysLeft = eventDate ? Math.ceil((eventDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0
  const registrationDaysLeft = registrationDeadline ? Math.ceil((registrationDeadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0

  const formatTime = (time: string) => {
    if (!time) return null
    try {
      return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    } catch {
      return time
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set'
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })
    } catch {
      return 'Invalid Date'
    }
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <Button variant="outline" onClick={() => router.back()} size="sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        {userRole === 'admin' && (
          <Button onClick={() => router.push(`/dashboard/events/${eventId}/edit`)} size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Edit Event
          </Button>
        )}
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-2xl md:text-3xl font-bold">{event.name}</h1>
          <Badge className={`${getStatusColor(event.status)} flex items-center gap-1 text-xs`}>
            {getStatusIcon(event.status)}
            {event.status || 'Draft'}
          </Badge>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 md:gap-6 text-xs md:text-sm text-muted-foreground">
          {eventDate && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 md:h-5 md:w-5" />
              <span className="font-medium hidden md:inline">{eventDate.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
              <span className="font-medium md:hidden">{eventDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: 'numeric'
              })}</span>
            </div>
          )}
          {event.venue && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 md:h-5 md:w-5" />
              <span className="truncate max-w-[150px] md:max-w-none">{event.venue}</span>
            </div>
          )}
          {event.start_time && event.end_time && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 md:h-5 md:w-5" />
              <span>{formatTime(event.start_time)} - {formatTime(event.end_time)}</span>
            </div>
          )}
        </div>
        
        {(daysLeft > 0 || registrationDaysLeft > 0) && userRole === 'admin' && (
          <div className="flex flex-wrap gap-2 md:gap-4">
            {daysLeft > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-1.5 md:px-4 md:py-2">
                <p className="text-xs md:text-sm font-medium text-blue-900">
                  {daysLeft} {daysLeft === 1 ? 'day' : 'days'} until event
                </p>
              </div>
            )}
            {registrationDaysLeft > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-1.5 md:px-4 md:py-2">
                <p className="text-xs md:text-sm font-medium text-orange-900">
                  {registrationDaysLeft} {registrationDaysLeft === 1 ? 'day' : 'days'} until registration
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-3 md:p-4 text-center">
            <Users className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-primary" />
            <p className="text-xl md:text-2xl font-bold">{event.total_teams || 0}</p>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">Teams</p>
            {event.max_teams && (
              <p className="text-xs text-muted-foreground">of {event.max_teams}</p>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 md:p-4 text-center">
            <Trophy className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-primary" />
            <p className="text-xl md:text-2xl font-bold">{event.total_judges || 0}</p>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">Judges</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 md:p-4 text-center">
            <FileText className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-primary" />
            <p className="text-xl md:text-2xl font-bold">{event.total_submissions || 0}</p>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">Submissions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 md:p-4 text-center">
            <Target className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-primary" />
            <p className="text-xl md:text-2xl font-bold">{event.completion_rate || 0}%</p>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">Complete</p>
          </CardContent>
        </Card>
      </div>

      {/* Event Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          <Card>
            <CardHeader className="p-3 md:p-4">
              <CardTitle className="text-lg md:text-xl">Event Description</CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0">
              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                {event.description || 'No description provided for this event.'}
              </p>
            </CardContent>
          </Card>

          {/* Schedule Information */}
          {(event.start_time || event.end_time || registrationDeadline) && (
            <Card>
              <CardHeader className="p-3 md:p-4">
                <CardTitle className="text-lg md:text-xl">Schedule & Timing</CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-4 pt-0">
                <div className="space-y-3">
                  {event.start_time && event.end_time && (
                    <div className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Event Duration</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatTime(event.start_time)} - {formatTime(event.end_time)}
                      </span>
                    </div>
                  )}
                  {registrationDeadline && (
                    <div className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Registration Deadline</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {registrationDeadline.toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar Information */}
        <div className="space-y-4 md:space-y-6">
          <Card>
            <CardHeader className="p-3 md:p-4">
              <CardTitle className="text-base md:text-lg">Event Details</CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0">
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b last:border-0">
                  <span className="text-xs md:text-sm font-medium text-muted-foreground">Status</span>
                  <Badge className={`${getStatusColor(event.status)} text-xs`}>
                    {event.status || 'Draft'}
                  </Badge>
                </div>
                
                {event.max_teams && (
                  <div className="flex justify-between items-center py-2 border-b last:border-0">
                    <span className="text-xs md:text-sm font-medium text-muted-foreground">Max Teams</span>
                    <span className="text-xs md:text-sm">{event.max_teams}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center py-2 border-b last:border-0">
                  <span className="text-xs md:text-sm font-medium text-muted-foreground">Created</span>
                  <span className="text-xs md:text-sm">
                    {formatDate(event.created_at)}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs md:text-sm font-medium text-muted-foreground">Last Updated</span>
                  <span className="text-xs md:text-sm">
                    {formatDate(event.updated_at)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="p-3 md:p-4">
              <CardTitle className="text-base md:text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0">
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-sm" 
                  size="sm"
                  onClick={() => router.push(`/dashboard/teams?event=${eventId}`)}
                >
                  <Users className="h-4 w-4 mr-2" />
                  View Teams
                </Button>
                {userRole === 'admin' && (
                  <>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-sm"
                      size="sm"
                      onClick={() => router.push(`/dashboard/events/${eventId}/edit`)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Edit Event
                    </Button>
                    <Button 
                      variant={event.leaderboard_visible ? "default" : "outline"}
                      className="w-full justify-start text-sm"
                      size="sm"
                      onClick={toggleLeaderboard}
                    >
                      {event.leaderboard_visible ? (
                        <><Unlock className="h-4 w-4 mr-2" />Leaderboard Visible</>
                      ) : (
                        <><Lock className="h-4 w-4 mr-2" />Leaderboard Locked</>
                      )}
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}