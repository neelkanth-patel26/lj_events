'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Calendar, Users, Trophy, UserPlus, BarChart3, TrendingUp, Clock, Award } from 'lucide-react'
import { useRealtime } from '@/components/realtime-provider'

export default function DashboardPage() {
  const { events, students, teams } = useRealtime()

  const upcomingEvents = events?.filter((event: any) => 
    new Date(event.event_date) > new Date() && event.status === 'active'
  ) || []

  const recentEvents = events?.filter((event: any) => event.status === 'completed')
    .sort((a: any, b: any) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime())
    .slice(0, 3) || []

  const topTeams = teams?.filter((t: any) => t.total_score > 0)
    .sort((a: any, b: any) => (b.total_score || 0) - (a.total_score || 0))
    .slice(0, 5) || []

  const stats = {
    totalEvents: events?.length || 0,
    activeEvents: events?.filter((e: any) => e.status === 'active').length || 0,
    totalTeams: teams?.length || 0,
    totalUsers: students?.length || 0,
    completionRate: teams?.length ? Math.round((teams.filter((t: any) => t.total_score > 0).length / teams.length) * 100) : 0,
    avgScore: teams?.length ? Math.round(teams.reduce((sum: number, t: any) => sum + (t.total_score || 0), 0) / teams.length) : 0
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-sm text-muted-foreground">LJ University Event Management System</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-primary" />
            <p className="text-xl md:text-2xl font-bold">{stats.totalEvents}</p>
            <p className="text-xs md:text-sm text-muted-foreground">Total Events</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-primary" />
            <p className="text-xl md:text-2xl font-bold">{stats.activeEvents}</p>
            <p className="text-xs md:text-sm text-muted-foreground">Active Events</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-primary" />
            <p className="text-xl md:text-2xl font-bold">{stats.totalTeams}</p>
            <p className="text-xs md:text-sm text-muted-foreground">Total Teams</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-primary" />
            <p className="text-xl md:text-2xl font-bold">{stats.totalUsers}</p>
            <p className="text-xs md:text-sm text-muted-foreground">Total Users</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/dashboard/events">
                <Button className="w-full h-16 md:h-20 flex-col gap-1.5" variant="outline">
                  <Calendar className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                  <span className="text-xs md:text-sm">Events</span>
                </Button>
              </Link>
              <Link href="/dashboard/students">
                <Button className="w-full h-16 md:h-20 flex-col gap-1.5" variant="outline">
                  <UserPlus className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                  <span className="text-xs md:text-sm">Students</span>
                </Button>
              </Link>
              <Link href="/dashboard/teams">
                <Button className="w-full h-16 md:h-20 flex-col gap-1.5" variant="outline">
                  <Users className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                  <span className="text-xs md:text-sm">Teams</span>
                </Button>
              </Link>
              <Link href="/dashboard/leaderboard">
                <Button className="w-full h-16 md:h-20 flex-col gap-1.5" variant="outline">
                  <Trophy className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                  <span className="text-xs md:text-sm">Leaderboard</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="h-4 w-4 text-primary" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-2">
                {upcomingEvents.slice(0, 3).map((event: any) => {
                  const daysLeft = Math.ceil((new Date(event.event_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                  return (
                    <Link key={event.id} href={`/dashboard/events/${event.id}`}>
                      <div className="p-2.5 md:p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between mb-1.5">
                          <h4 className="font-semibold text-sm truncate">{event.name}</h4>
                          <Badge variant={daysLeft <= 3 ? 'destructive' : daysLeft <= 7 ? 'default' : 'secondary'} className="text-xs">
                            {daysLeft}d
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{new Date(event.event_date).toLocaleDateString()}</span>
                          <span>{event.total_teams || 0} teams</span>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <Calendar className="h-10 w-10 md:h-12 md:w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-xs md:text-sm text-muted-foreground">No upcoming events</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Award className="h-4 w-4 text-primary" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm">Real-time Updates</span>
                <Badge variant="default" className="text-xs">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm">Database</span>
                <Badge variant="default" className="text-xs">Connected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs md:text-sm">File Upload</span>
                <Badge variant="default" className="text-xs">Ready</Badge>
              </div>
              <div className="mt-3 p-2.5 md:p-3 bg-muted rounded-lg">
                <p className="text-xs md:text-sm font-medium">Completion Rate</p>
                <Progress value={stats.completionRate} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">{stats.completionRate}% teams have scores</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Teams & Recent Activity */}
      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
        {/* Top Performing Teams */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="h-4 w-4 text-primary" />
              Top Performing Teams
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topTeams.length > 0 ? (
              <div className="space-y-2">
                {topTeams.map((team: any, index: number) => (
                  <div key={team.id} className="flex items-center justify-between p-2.5 md:p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-100 text-gray-700' :
                        index === 2 ? 'bg-orange-100 text-orange-700' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{team.team_name}</p>
                        <p className="text-xs text-muted-foreground">{team.school_name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{team.total_score}</p>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Trophy className="h-10 w-10 md:h-12 md:w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-xs md:text-sm text-muted-foreground">No scored teams yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Events */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-4 w-4 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentEvents.length > 0 ? (
              <div className="space-y-2">
                {recentEvents.map((event: any) => (
                  <Link key={event.id} href={`/dashboard/events/${event.id}`}>
                    <div className="p-2.5 md:p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-sm truncate">{event.name}</h4>
                        <Badge variant="outline" className="text-xs">Completed</Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{new Date(event.event_date).toLocaleDateString()}</span>
                        <span>{event.total_teams || 0} teams participated</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <BarChart3 className="h-10 w-10 md:h-12 md:w-12 mx-auto text-muted-foreground mb-2" />
                <p className="text-xs md:text-sm text-muted-foreground">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
