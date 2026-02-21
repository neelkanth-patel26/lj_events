'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Calendar, Users, Trophy, Gavel, Clock, ArrowUpRight, Award } from 'lucide-react'
import { useRealtime } from '@/components/realtime-provider'
import { useMemo } from 'react'
import { useRouter } from 'next/navigation'

export default function MentorDashboard() {
  const { events, teams } = useRealtime()
  const router = useRouter()

  const stats = useMemo(() => {
    const activeEvents = events?.filter((e: any) => e.status === 'active') || []
    const upcomingEvents = events?.filter((event: any) => 
      new Date(event.event_date) > new Date() && event.status === 'active'
    ) || []
    
    const totalTeams = teams?.length || 0
    const scoredTeams = teams?.filter((t: any) => t.total_score > 0).length || 0
    const pendingTeams = totalTeams - scoredTeams

    const topTeams = teams?.filter((t: any) => t.total_score > 0)
      .sort((a: any, b: any) => (b.total_score || 0) - (a.total_score || 0))
      .slice(0, 5) || []

    return {
      activeEvents: activeEvents.length,
      totalTeams,
      scoredTeams,
      pendingTeams,
      upcomingEvents,
      topTeams
    }
  }, [events, teams])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Mentor Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-1">Evaluate teams and view competition progress</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{stats.activeEvents}</p>
            <p className="text-xs text-muted-foreground">Active Events</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{stats.totalTeams}</p>
            <p className="text-xs text-muted-foreground">Total Teams</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{stats.scoredTeams}</p>
            <p className="text-xs text-muted-foreground">Evaluated</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Gavel className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{stats.pendingTeams}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Upcoming Events */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link href="/dashboard/judging">
                <Button className="w-full justify-start gap-3 h-auto py-4" variant="outline">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Gavel className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-semibold">Start Judging</div>
                    <div className="text-xs text-muted-foreground">Evaluate team submissions</div>
                  </div>
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link href="/dashboard/teams">
                <Button className="w-full justify-start gap-3 h-auto py-4" variant="outline">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-semibold">View Teams</div>
                    <div className="text-xs text-muted-foreground">Browse all participating teams</div>
                  </div>
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </Link>

              <Link href="/dashboard/leaderboard">
                <Button className="w-full justify-start gap-3 h-auto py-4" variant="outline">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-semibold">Leaderboard</div>
                    <div className="text-xs text-muted-foreground">View rankings and scores</div>
                  </div>
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Upcoming Events
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.upcomingEvents.length > 0 ? (
              <div className="space-y-2">
                {stats.upcomingEvents.slice(0, 4).map((event: any) => {
                  const daysLeft = Math.ceil((new Date(event.event_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                  return (
                    <div key={event.id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-sm truncate">{event.name}</h4>
                        <Badge variant={daysLeft <= 3 ? 'destructive' : 'secondary'} className="text-xs">
                          {daysLeft}d
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{new Date(event.event_date).toLocaleDateString()}</span>
                        <span>{event.total_teams || 0} teams</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No upcoming events</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Teams */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Top Performing Teams
            </div>
            <Link href="/dashboard/leaderboard">
              <Button variant="ghost" size="sm" className="h-7 text-xs">
                View All
                <ArrowUpRight className="h-3 w-3 ml-1" />
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {stats.topTeams.length > 0 ? (
            <div className="space-y-2">
              {stats.topTeams.map((team: any, index: number) => (
                <div key={team.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-700' :
                    index === 1 ? 'bg-gray-100 text-gray-700' :
                    index === 2 ? 'bg-orange-100 text-orange-700' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    #{index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{team.team_name}</p>
                    <p className="text-xs text-muted-foreground truncate">{team.school_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{team.total_score}</p>
                    <p className="text-xs text-muted-foreground">pts</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Trophy className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No scored teams yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
