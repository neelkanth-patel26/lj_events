'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Mail, ArrowLeft, MapPin, School, Trophy, Calendar } from 'lucide-react'
import { useParams } from 'next/navigation'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json())

export default function TeamMembersPage() {
  const params = useParams()
  const { data: team, error } = useSWR(`/api/teams/${params.id}`, fetcher)

  if (error) return <div className="p-8 text-center text-red-600">Error loading team</div>
  if (!team) return <div className="p-8 text-center">Loading...</div>

  const groupNumber = team.team_name?.replace('Team ', '') || 'N/A'
  const memberCount = team.team_members?.length || 0
  const createdDate = team.created_at ? new Date(team.created_at).toLocaleDateString() : 'Unknown'

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => window.history.back()} size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{team.team_name || `Team ${groupNumber}`}</h1>
            <p className="text-sm text-muted-foreground">{team.school_name || 'LJ University'}</p>
          </div>
        </div>
        <Badge variant="secondary" className="text-sm md:text-base px-3 py-1 w-fit">
          Group {groupNumber}
        </Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-3 md:p-4 text-center">
            <Users className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-primary" />
            <p className="text-xl md:text-2xl font-bold">{memberCount}</p>
            <p className="text-xs md:text-sm text-muted-foreground">Members</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4 text-center">
            <Trophy className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-primary" />
            <p className="text-xl md:text-2xl font-bold">{team.total_score || 0}</p>
            <p className="text-xs md:text-sm text-muted-foreground">Score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4 text-center">
            <MapPin className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-primary" />
            <p className="text-base md:text-lg font-bold">{team.stall_no || 'N/A'}</p>
            <p className="text-xs md:text-sm text-muted-foreground">Stall</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4 text-center">
            <Calendar className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-primary" />
            <p className="text-xs md:text-sm font-bold">{createdDate}</p>
            <p className="text-xs md:text-sm text-muted-foreground">Created</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
        {/* Team Details */}
        <Card className="lg:col-span-1">
          <CardHeader className="p-3 md:p-4">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <School className="h-4 w-4 md:h-5 md:w-5" />
              Team Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-3 md:p-4 pt-0">
            <div>
              <p className="text-xs md:text-sm font-medium text-muted-foreground">Team Name</p>
              <p className="text-base md:text-lg font-semibold">{team.team_name}</p>
            </div>
            <div>
              <p className="text-xs md:text-sm font-medium text-muted-foreground">School</p>
              <p className="text-sm md:text-base font-medium">{team.school_name || 'LJ University'}</p>
            </div>
            {team.domain && (
              <div>
                <p className="text-xs md:text-sm font-medium text-muted-foreground">Domain</p>
                <Badge variant="outline" className="text-xs">{team.domain}</Badge>
              </div>
            )}
            {team.stall_no && (
              <div>
                <p className="text-xs md:text-sm font-medium text-muted-foreground">Stall Location</p>
                <p className="text-sm md:text-base font-medium">{team.stall_no}</p>
              </div>
            )}
            <div>
              <p className="text-xs md:text-sm font-medium text-muted-foreground">Team ID</p>
              <p className="text-xs font-mono bg-muted p-2 rounded break-all">{team.id}</p>
            </div>
            <div>
              <p className="text-xs md:text-sm font-medium text-muted-foreground">Performance</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${Math.min((team.total_score || 0) / 100 * 100, 100)}%` }}
                  />
                </div>
                <span className="text-xs md:text-sm font-medium">{team.total_score || 0}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card className="lg:col-span-2">
          <CardHeader className="p-3 md:p-4">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Users className="h-4 w-4 md:h-5 md:w-5" />
              Team Members ({memberCount})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-4 pt-0">
            {memberCount > 0 ? (
              <div className="space-y-3">
                {team.team_members.map((member: any, index: number) => (
                  <div key={member.id} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-base md:text-lg flex-shrink-0">
                      {member.users?.full_name?.charAt(0) || (index + 1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-sm md:text-base truncate">{member.users?.full_name || 'Unknown Member'}</p>
                          <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                            <Mail className="h-3 w-3 md:h-4 md:w-4" />
                            <span className="truncate">{member.users?.email || 'No email'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={member.role === 'leader' ? 'default' : 'secondary'} className="text-xs">
                            {member.role || 'Member'}
                          </Badge>
                          <p className="text-xs text-muted-foreground">#{index + 1}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Team Summary */}
                <div className="mt-4 p-3 md:p-4 bg-muted rounded-lg border">
                  <h4 className="font-semibold text-sm md:text-base mb-3">Team Summary</h4>
                  <div className="grid grid-cols-3 gap-3 md:gap-4 text-center">
                    <div>
                      <p className="text-lg md:text-xl font-bold">{memberCount}</p>
                      <p className="text-xs text-muted-foreground">Total Members</p>
                    </div>
                    <div>
                      <p className="text-lg md:text-xl font-bold">{team.team_members.filter((m: any) => m.role === 'leader').length}</p>
                      <p className="text-xs text-muted-foreground">Leaders</p>
                    </div>
                    <div>
                      <p className="text-lg md:text-xl font-bold">{memberCount > 0 ? Math.round((team.total_score || 0) / memberCount) : 0}</p>
                      <p className="text-xs text-muted-foreground">Avg Score</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 md:py-12">
                <Users className="h-12 w-12 md:h-16 md:w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-base md:text-lg font-medium text-muted-foreground mb-2">No members found</p>
                <p className="text-xs md:text-sm text-muted-foreground">This team doesn't have any members assigned yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}