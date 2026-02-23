'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Users, ArrowRight, MapPin, Trophy, UserCog } from 'lucide-react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function AssignJudgesPage() {
  const router = useRouter()
  const { data: events, isLoading } = useSWR('/api/events', fetcher)
  const { data: teams } = useSWR('/api/teams', fetcher)
  const { data: assignments } = useSWR('/api/teams/judges', fetcher)

  const getEventStats = (eventId: string) => {
    const eventTeams = teams?.filter((t: any) => t.event_id === eventId) || []
    const eventAssignments = Array.isArray(assignments) ? assignments.filter((a: any) => a.event_id === eventId) : []
    return {
      totalTeams: eventTeams.length,
      totalScore: eventTeams.reduce((sum: number, t: any) => sum + (t.total_score || 0), 0),
      avgScore: eventTeams.length ? Math.round(eventTeams.reduce((sum: number, t: any) => sum + (t.total_score || 0), 0) / eventTeams.length) : 0,
      judgesAssigned: eventAssignments.length
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Assign Judges</h1>
          <p className="text-sm text-muted-foreground mt-1">Assign mentors to evaluate teams</p>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-2">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  <div className="flex gap-3">
                    <div className="h-5 bg-gray-200 rounded w-24"></div>
                    <div className="h-5 bg-gray-200 rounded w-24"></div>
                    <div className="h-5 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="h-10 bg-gray-200 rounded w-32"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white">Assign Judges</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">Assign mentors to evaluate teams</p>
        </div>
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
          <UserCog className="h-5 w-5 md:h-6 md:w-6 text-gray-700 dark:text-gray-300" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 md:gap-4">
        <Card className="border shadow-sm dark:bg-neutral-900 dark:border-neutral-800">
          <CardContent className="p-3 md:p-4 text-center">
            <div className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-1 md:mb-2 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
              <Calendar className="h-4 w-4 md:h-6 md:w-6 text-gray-700 dark:text-gray-300" />
            </div>
            <p className="text-lg md:text-2xl font-bold dark:text-white">{events?.length || 0}</p>
            <p className="text-xs md:text-sm text-muted-foreground">Events</p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm dark:bg-neutral-900 dark:border-neutral-800">
          <CardContent className="p-3 md:p-4 text-center">
            <div className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-1 md:mb-2 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
              <Users className="h-4 w-4 md:h-6 md:w-6 text-gray-700 dark:text-gray-300" />
            </div>
            <p className="text-lg md:text-2xl font-bold dark:text-white">{teams?.length || 0}</p>
            <p className="text-xs md:text-sm text-muted-foreground">Teams</p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm dark:bg-neutral-900 dark:border-neutral-800">
          <CardContent className="p-3 md:p-4 text-center">
            <div className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-1 md:mb-2 rounded-lg bg-gray-100 dark:bg-neutral-800 flex items-center justify-center">
              <UserCog className="h-4 w-4 md:h-6 md:w-6 text-gray-700 dark:text-gray-300" />
            </div>
            <p className="text-lg md:text-2xl font-bold dark:text-white">{events?.filter((e: any) => e.status === 'active').length || 0}</p>
            <p className="text-xs md:text-sm text-muted-foreground">Active</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        {events?.map((event: any) => {
          const stats = getEventStats(event.id)
          return (
            <Card key={event.id} className="border-2 hover:border-gray-400 dark:hover:border-gray-600 hover:shadow-lg transition-all dark:bg-neutral-900 dark:border-neutral-800">
              <CardContent className="p-4 md:p-6">
                <div className="space-y-3 md:space-y-4">
                  <div>
                    <h3 className="text-lg md:text-xl font-bold mb-2 dark:text-white">{event.name}</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={event.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                        {event.status || 'upcoming'}
                      </Badge>
                      {event.location && (
                        <Badge variant="outline" className="text-xs">
                          <MapPin className="h-3 w-3 mr-1" />
                          {event.location}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 md:gap-3">
                    <div className="flex items-center gap-1.5 md:gap-2 text-sm">
                      <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300 text-[10px] md:text-xs truncate">{new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-1.5 md:gap-2 text-sm">
                      <Users className="h-3.5 w-3.5 md:h-4 md:w-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300 text-[10px] md:text-xs">{stats.totalTeams} teams</span>
                    </div>
                    <div className="flex items-center gap-1.5 md:gap-2 text-sm">
                      <Trophy className="h-3.5 w-3.5 md:h-4 md:w-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300 text-[10px] md:text-xs">Avg: {stats.avgScore}</span>
                    </div>
                    <div className="flex items-center gap-1.5 md:gap-2 text-sm">
                      <UserCog className="h-3.5 w-3.5 md:h-4 md:w-4 text-gray-600 dark:text-gray-400 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300 text-[10px] md:text-xs">{stats.judgesAssigned} judges</span>
                    </div>
                  </div>

                  {event.description && (
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{event.description}</p>
                  )}
                  
                  <Button 
                    onClick={() => router.push(`/dashboard/events/${event.id}/assign-judges`)}
                    className="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 dark:text-gray-900 w-full text-sm md:text-base h-9 md:h-10"
                  >
                    Assign Judges
                    <ArrowRight className="h-3.5 w-3.5 md:h-4 md:w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {(!events || events.length === 0) && (
        <Card className="dark:bg-neutral-900 dark:border-neutral-800">
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-muted-foreground">No events found</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
