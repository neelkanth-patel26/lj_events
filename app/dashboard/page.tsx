'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Calendar, Users, Trophy, UserPlus, BarChart3, Clock, Award, Zap, Activity, ArrowUpRight, Gavel, TrendingUp, Target, CheckCircle2, XCircle } from 'lucide-react'
import { useRealtime } from '@/components/realtime-provider'
import { useMemo, useEffect, useState } from 'react'

export default function DashboardPage() {
  const { events, students, teams } = useRealtime()
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const checkRole = async () => {
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data } = await supabase.from('users').select('role').eq('id', user.id).single()
          setUserRole(data?.role || 'admin')
        } else {
          setUserRole('admin')
        }
      } catch (error) {
        console.error('Error fetching role:', error)
        setUserRole('admin')
      }
    }
    checkRole()
  }, [])

  const stats = useMemo(() => {
    const upcomingEvents = events?.filter((event: any) => 
      new Date(event.event_date) > new Date() && event.status === 'active'
    ) || []

    const recentEvents = events?.filter((event: any) => event.status !== 'draft')
      .sort((a: any, b: any) => new Date(b.created_at || b.event_date).getTime() - new Date(a.created_at || a.event_date).getTime())
      .slice(0, 3) || []

    const hasVisibleLeaderboard = events?.some((e: any) => e.leaderboard_visible) || false
    const canViewScores = userRole === 'admin' || hasVisibleLeaderboard

    const topTeams = userRole === 'admin' ? (teams?.filter((t: any) => t.total_score > 0)
      .sort((a: any, b: any) => (b.total_score || 0) - (a.total_score || 0))
      .slice(0, 5) || []) : []

    const totalEvents = events?.length || 0
    const activeEvents = events?.filter((e: any) => e.status === 'active').length || 0
    const draftEvents = events?.filter((e: any) => e.status === 'draft').length || 0
    const completedEvents = events?.filter((e: any) => e.status === 'completed').length || 0
    const totalTeams = teams?.length || 0
    const totalUsers = students?.length || 0
    const scoredTeams = canViewScores ? (teams?.filter((t: any) => t.total_score > 0).length || 0) : 0
    const pendingTeams = canViewScores ? (totalTeams - scoredTeams) : 0
    const completionRate = canViewScores && totalTeams ? Math.round((scoredTeams / totalTeams) * 100) : 0

    const domains = [...new Set(teams?.map((t: any) => t.domain).filter(Boolean))] || []
    const studentsByRole = {
      students: students?.filter((s: any) => s.role === 'student').length || 0,
      mentors: students?.filter((s: any) => s.role === 'mentor').length || 0,
      admins: students?.filter((s: any) => s.role === 'admin').length || 0
    }

    const avgTeamSize = totalTeams ? Math.round(teams.reduce((sum: number, t: any) => sum + (t.team_size || 0), 0) / totalTeams) : 0
    const topScore = canViewScores && teams?.length ? Math.max(...teams.map((t: any) => t.total_score || 0)) : 0
    const avgScore = canViewScores && scoredTeams ? Math.round(teams.filter((t: any) => t.total_score > 0).reduce((sum: number, t: any) => sum + (t.total_score || 0), 0) / scoredTeams) : 0

    return {
      totalEvents,
      activeEvents,
      draftEvents,
      completedEvents,
      totalTeams,
      totalUsers,
      completionRate,
      scoredTeams,
      pendingTeams,
      upcomingEvents,
      recentEvents,
      topTeams,
      domains,
      studentsByRole,
      canViewScores,
      avgTeamSize,
      topScore,
      avgScore
    }
  }, [events, students, teams, userRole])

  if (!userRole) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  // Mentor Dashboard
  if (userRole === 'mentor') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Mentor Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">Evaluate teams and view competition progress</p>
        </div>

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
              <p className="text-2xl font-bold">{stats.canViewScores ? stats.scoredTeams : '***'}</p>
              <p className="text-xs text-muted-foreground">Evaluated</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Gavel className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{stats.canViewScores ? stats.pendingTeams : '***'}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Student Dashboard
  if (userRole === 'student') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Student Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">View your team and competition progress</p>
        </div>

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
              <p className="text-2xl font-bold">{stats.canViewScores ? stats.scoredTeams : '***'}</p>
              <p className="text-xs text-muted-foreground">Evaluated</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Gavel className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{stats.canViewScores ? stats.pendingTeams : '***'}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Admin Dashboard - Always show full access
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-sm text-muted-foreground mt-1">LJ University Event Management System</p>
        </div>
        <Link href="/dashboard/events">
          <Button size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            New Event
          </Button>
        </Link>
      </div>

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
            <p className="text-2xl font-bold">{stats.studentsByRole.admins}</p>
            <p className="text-xs text-muted-foreground">Admins</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 mx-auto mb-2 text-gray-700" />
            <p className="text-2xl font-bold">{stats.topScore}</p>
            <p className="text-xs text-muted-foreground">Highest Score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 mx-auto mb-2 text-gray-700" />
            <p className="text-2xl font-bold">{stats.avgScore}</p>
            <p className="text-xs text-muted-foreground">Average Score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-gray-700" />
            <p className="text-2xl font-bold">{stats.scoredTeams}</p>
            <p className="text-xs text-muted-foreground">Evaluated</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <XCircle className="h-8 w-8 mx-auto mb-2 text-gray-700" />
            <p className="text-2xl font-bold">{stats.pendingTeams}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Event Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Active</span>
                <Badge variant="default">{stats.activeEvents}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Draft</span>
                <Badge variant="secondary">{stats.draftEvents}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Completed</span>
                <Badge variant="outline">{stats.completedEvents}</Badge>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Completion Rate</span>
                  <span className="text-sm font-bold">{stats.completionRate}%</span>
                </div>
                <Progress value={stats.completionRate} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              User Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
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
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Avg Team Size</span>
                  <span className="font-bold">{stats.avgTeamSize}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Domain Coverage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.domains.length > 0 ? (
                stats.domains.slice(0, 5).map((domain: string) => (
                  <div key={domain} className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">{domain}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {teams?.filter((t: any) => t.domain === domain).length} teams
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No domains yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
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
                  <Link key={team.id} href={`/dashboard/teams/${team.id}/members`}>
                    <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                        index === 0 ? 'bg-gray-900 text-white' :
                        index === 1 ? 'bg-gray-700 text-white' :
                        index === 2 ? 'bg-gray-500 text-white' :
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
                  </Link>
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
                  <span className="text-muted-foreground">Upcoming Events</span>
                  <span className="font-medium">{stats.upcomingEvents.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Domains</span>
                  <span className="font-medium">{stats.domains.length}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
