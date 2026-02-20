'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Trophy, Medal, Award, TrendingUp, Users, Target, Download, RefreshCw, Grid, List } from 'lucide-react'
import { useState } from 'react'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function LeaderboardPage() {
  const { data: events } = useSWR('/api/events', fetcher)
  const [selectedEvent, setSelectedEvent] = useState<string>('')
  const [calculating, setCalculating] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const { data: rankings, mutate } = useSWR(
    selectedEvent ? `/api/leaderboard?eventId=${selectedEvent}` : null,
    (url) => fetch(url, { cache: 'no-store' }).then(r => r.json())
  )

  const calculateRankings = async () => {
    if (!selectedEvent) return
    setCalculating(true)
    try {
      await fetch(`/api/leaderboard/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: selectedEvent }),
      })
      mutate()
    } catch (error) {
      console.error('Error calculating rankings:', error)
    } finally {
      setCalculating(false)
    }
  }

  const exportLeaderboard = () => {
    if (!rankings) return
    const csvContent = 'Rank,Team Name,School,Domain,Score\n' + 
      rankings.map((team: any, index: number) => 
        `${index + 1},${team.team_name},${team.school_name || ''},${team.domain || ''},${team.total_score || 0}`
      ).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `leaderboard-${selectedEvent}.csv`
    a.click()
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-5 w-5 md:h-6 md:w-6 text-yellow-600" />
      case 2: return <Medal className="h-5 w-5 md:h-6 md:w-6 text-gray-600" />
      case 3: return <Award className="h-5 w-5 md:h-6 md:w-6 text-orange-600" />
      default: return <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-muted-foreground font-bold text-sm">#{rank}</div>
    }
  }

  const topScore = rankings?.length ? Math.max(...rankings.map((team: any) => team.total_score || 0)) : 0
  const avgScore = rankings?.length ? (rankings.reduce((sum: number, team: any) => sum + (team.total_score || 0), 0) / rankings.length).toFixed(1) : 0

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Leaderboard</h1>
          <p className="text-sm text-muted-foreground mt-1">View team rankings and scores</p>
        </div>
        {rankings && rankings.length > 0 && (
          <Button onClick={exportLeaderboard} variant="outline" size="sm" className="w-fit">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        )}
      </div>

      {/* Stats Overview */}
      {rankings && rankings.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card>
            <CardContent className="p-3 md:p-4 text-center">
              <Users className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-primary" />
              <p className="text-xl md:text-2xl font-bold">{rankings.length}</p>
              <p className="text-xs md:text-sm text-muted-foreground">Total Teams</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:p-4 text-center">
              <Trophy className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-primary" />
              <p className="text-xl md:text-2xl font-bold">{topScore}</p>
              <p className="text-xs md:text-sm text-muted-foreground">Top Score</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:p-4 text-center">
              <Target className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-primary" />
              <p className="text-xl md:text-2xl font-bold">{avgScore}</p>
              <p className="text-xs md:text-sm text-muted-foreground">Avg Score</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 md:p-4 text-center">
              <TrendingUp className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-primary" />
              <p className="text-xl md:text-2xl font-bold">{Math.round((topScore - parseFloat(avgScore.toString())) / topScore * 100)}%</p>
              <p className="text-xs md:text-sm text-muted-foreground">Competition</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Controls */}
      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="flex flex-col md:flex-row gap-2 md:gap-4 md:items-center">
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger className="w-full md:flex-1">
                <SelectValue placeholder="Select an event" />
              </SelectTrigger>
              <SelectContent>
                {events?.map((event: any) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.name} - {new Date(event.event_date).toLocaleDateString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              {selectedEvent && (
                <Button onClick={calculateRankings} disabled={calculating} variant="outline" size="sm" className="flex-1 md:flex-none">
                  <RefreshCw className={`h-4 w-4 mr-2 ${calculating ? 'animate-spin' : ''}`} />
                  {calculating ? 'Calculating...' : 'Refresh'}
                </Button>
              )}
              {rankings && rankings.length > 0 && (
                <div className="flex border rounded-md">
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
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rankings Display */}
      {rankings && rankings.length > 0 && (
        viewMode === 'grid' ? (
          <div className="grid gap-3 md:gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rankings.map((team: any, index: number) => {
              const rank = index + 1
              const scorePercentage = topScore > 0 ? (team.total_score / topScore) * 100 : 0
              
              return (
                <Card key={team.id} className={`hover:shadow-md transition-shadow ${rank <= 3 ? 'ring-2 ring-primary/30' : ''}`}>
                  <CardHeader className="pb-2 p-3 md:p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getRankIcon(rank)}
                        <Badge variant={rank <= 3 ? 'default' : 'outline'} className="text-xs">#{rank}</Badge>
                      </div>
                      <div className="text-xl md:text-2xl font-bold">{team.total_score || 0}</div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 md:p-4 pt-0">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-sm md:text-base">{team.team_name}</h3>
                      <p className="text-xs md:text-sm text-muted-foreground">{team.school_name}</p>
                      {team.domain && (
                        <Badge variant="secondary" className="text-xs">{team.domain}</Badge>
                      )}
                      <Progress value={scorePercentage} className="mt-2" />
                      <p className="text-xs text-muted-foreground">{scorePercentage.toFixed(1)}% of top score</p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card>
            <CardHeader className="p-3 md:p-4">
              <CardTitle className="text-lg">Rankings</CardTitle>
            </CardHeader>
            <CardContent className="p-3 md:p-4 pt-0">
              <div className="space-y-2">
                {rankings.map((team: any, index: number) => {
                  const rank = index + 1
                  const scorePercentage = topScore > 0 ? (team.total_score / topScore) * 100 : 0
                  
                  return (
                    <div
                      key={team.id}
                      className={`flex items-center justify-between p-3 md:p-4 border rounded-lg hover:bg-muted/50 transition-colors ${
                        rank <= 3 ? 'bg-muted/30' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                        <div className="flex items-center justify-center w-8 md:w-12 flex-shrink-0">
                          {getRankIcon(rank)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="font-semibold text-sm md:text-lg truncate">{team.team_name}</div>
                            <Badge variant={rank <= 3 ? 'default' : 'outline'} className="text-xs">#{rank}</Badge>
                          </div>
                          <div className="text-xs md:text-sm text-muted-foreground flex flex-wrap items-center gap-2">
                            <span className="truncate">{team.school_name}</span>
                            {team.domain && (
                              <Badge variant="outline" className="text-xs">
                                {team.domain}
                              </Badge>
                            )}
                            {team.stall_no && (
                              <span className="hidden md:inline">Stall {team.stall_no}</span>
                            )}
                          </div>
                          <Progress value={scorePercentage} className="mt-2 max-w-[200px]" />
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <div className="text-lg md:text-2xl font-bold">{team.total_score || 0}</div>
                        <div className="text-xs md:text-sm text-muted-foreground">
                          {scorePercentage.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )
      )}

      {selectedEvent && (!rankings || rankings.length === 0) && (
        <Card>
          <CardContent className="p-4 md:pt-6">
            <div className="text-center py-6 md:py-8">
              <Trophy className="h-10 w-10 md:h-12 md:w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm md:text-base text-muted-foreground mb-2">No rankings calculated yet</p>
              <p className="text-xs md:text-sm text-muted-foreground mb-4">
                Click "Refresh" to calculate scores for all teams in this event
              </p>
              <Button onClick={calculateRankings} disabled={calculating} size="sm">
                <RefreshCw className={`h-4 w-4 mr-2 ${calculating ? 'animate-spin' : ''}`} />
                {calculating ? 'Calculating...' : 'Calculate Rankings'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
