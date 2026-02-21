'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Calendar, Users, Trophy, UserPlus, BarChart3, TrendingUp, Clock, Award, Target, Zap, Activity, ArrowUpRight, MapPin } from 'lucide-react'
import { useRealtime } from '@/components/realtime-provider'
import { useMemo } from 'react'

export default function DashboardPage() {
  const { events, students, teams } = useRealtime()

  const stats = useMemo(() => {
    const upcomingEvents = events?.filter((event: any) => 
      new Date(event.event_date) > new Date() && event.status === 'active'
    ) || []

    const recentEvents = events?.filter((event: any) => event.status === 'completed')
      .sort((a: any, b: any) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime())
      .slice(0, 3) || []

    const topTeams = teams?.filter((t: any) => t.total_score > 0)
      .sort((a: any, b: any) => (b.total_score || 0) - (a.total_score || 0))
      .slice(0, 5) || []

    const totalEvents = events?.length || 0
    const activeEvents = events?.filter((e: any) => e.status === 'active').length || 0
    const totalTeams = teams?.length || 0
    const totalUsers = students?.length || 0
    const scoredTeams = teams?.filter((t: any) => t.total_score > 0).length || 0
    const completionRate = totalTeams ? Math.round((scoredTeams / totalTeams) * 100) : 0
    const avgScore = totalTeams ? Math.round(teams.reduce((sum: number, t: any) => sum + (t.total_score || 0), 0) / totalTeams) : 0
    const topScore = teams?.length ? Math.max(...teams.map((t: any) => t.total_score || 0)) : 0

    const domains = [...new Set(teams?.map((t: any) => t.domain).filter(Boolean))] || []
    const studentsByRole = {
      students: students?.filter((s: any) => s.role === 'student').length || 0,
      mentors: students?.filter((s: any) => s.role === 'mentor').length || 0,
      admins: students?.filter((s: any) => s.role === 'admin').length || 0
    }

    return {
      totalEvents,
      activeEvents,
      totalTeams,
      totalUsers,
      completionRate,
      avgScore,
      topScore,
      scoredTeams,
      upcomingEvents,
      recentEvents,
      topTeams,
      domains,
      studentsByRole
    }
  }, [events, students, teams])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">LJ University Event Management System</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/events">
            <Button size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              New Event
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{stats.totalEvents}</p>
            <p className="text-xs text-muted-foreground">Total Events</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
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
            <UserPlus className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{stats.totalUsers}</p>
            <p className="text-xs text-muted-foreground">Total Users</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Activity */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/dashboard/events">
                <Button className="w-full h-20 flex-col gap-2" variant="outline">
                  <Calendar className="h-6 w-6 text-blue-600" />
                  <span className="text-xs font-medium">Events</span>
                </Button>
              </Link>
              <Link href="/dashboard/students">
                <Button className="w-full h-20 flex-col gap-2" variant="outline">
                  <UserPlus className="h-6 w-6 text-green-600" />
                  <span className="text-xs font-medium">Students</span>
                </Button>
              </Link>
              <Link href="/dashboard/teams">
                <Button className="w-full h-20 flex-col gap-2" variant="outline">
                  <Users className="h-6 w-6 text-purple-600" />
                  <span className="text-xs font-medium">Teams</span>
                </Button>
              </Link>
              <Link href="/dashboard/leaderboard">
                <Button className="w-full h-20 flex-col gap-2" variant="outline">
                  <Trophy className="h-6 w-6 text-orange-600" />
                  <span className="text-xs font-medium">Leaderboard</span>
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
              <Link href="/dashboard/events">
                <Button variant="ghost" size="sm" className="h-7 text-xs">
                  View All
                  <ArrowUpRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.upcomingEvents.length > 0 ? (
              <div className="space-y-2">
                {stats.upcomingEvents.slice(0, 3).map((event: any) => {
                  const daysLeft = Math.ceil((new Date(event.event_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                  return (
                    <Link key={event.id} href={`/dashboard/events/${event.id}`}>
                      <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
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
                    </Link>
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

        {/* System Overview */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              System Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Completion Rate</span>
                  <span className="text-sm font-bold">{stats.completionRate}%</span>
                </div>
                <Progress value={stats.completionRate} className="h-2" />
              </div>
              
              <div className="pt-2 border-t space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Students</span>
                  <span className="font-medium">{stats.studentsByRole.students}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Mentors</span>
                  <span className="font-medium">{stats.studentsByRole.mentors}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Admins</span>
                  <span className="font-medium">{stats.studentsByRole.admins}</span>
                </div>
              </div>

              <div className="pt-2 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Domains</span>
                  <Badge variant="secondary">{stats.domains.length}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Teams & Recent Activity */}
      <div className="grid gap-4 lg:grid-cols-2">
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

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Recent Activity
              </div>
              <Link href="/dashboard/events">
                <Button variant="ghost" size="sm" className="h-7 text-xs">
                  View All
                  <ArrowUpRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentEvents.length > 0 ? (
              <div className="space-y-2">
                {stats.recentEvents.map((event: any) => (
                  <Link key={event.id} href={`/dashboard/events/${event.id}`}>
                    <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-sm truncate">{event.name}</h4>
                        <Badge variant="outline" className="text-xs">Completed</Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{new Date(event.event_date).toLocaleDateString()}</span>
                        <span>{event.total_teams || 0} teams</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No recent activity</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
