'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Trophy, Medal, Award, TrendingUp, Users, Target, Download, RefreshCw, Grid, List, MapPin } from 'lucide-react'
import { useState } from 'react'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function LeaderboardPage() {
  const { data: events } = useSWR('/api/events', fetcher)
  const [selectedEvent, setSelectedEvent] = useState<string>('')
  const [calculating, setCalculating] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
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

  const exportLeaderboard = async () => {
    if (!rankings || !selectedEvent) return
    
    try {
      const response = await fetch('/api/leaderboard/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: selectedEvent })
      })

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `leaderboard-${selectedEvent}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting PDF:', error)
      alert('Failed to export PDF')
    }
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-600" />
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-600" />
    if (rank === 3) return <Award className="h-5 w-5 text-orange-600" />
    return null
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <Card>
          <CardContent className="p-3 md:p-4 text-center">
            <Users className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 text-primary" />
            <p className="text-xl md:text-2xl font-bold">{rankings?.length || 0}</p>
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
            <p className="text-xl md:text-2xl font-bold">{rankings?.filter((t: any) => (t.total_score || 0) > 0).length || 0}</p>
            <p className="text-xs md:text-sm text-muted-foreground">Scored</p>
          </CardContent>
        </Card>
      </div>

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
                    {event.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              {selectedEvent && (
                <Button onClick={calculateRankings} disabled={calculating} variant="outline" size="sm">
                  <RefreshCw className={`h-4 w-4 mr-2 ${calculating ? 'animate-spin' : ''}`} />
                  Refresh
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
      {rankings && rankings.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid gap-3 md:gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rankings.map((team: any, index: number) => {
              const rank = index + 1
              const rankIcon = getRankIcon(rank)
              
              return (
                <Card key={team.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="p-3 md:p-4">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {rankIcon && <div className="flex-shrink-0">{rankIcon}</div>}
                          <CardTitle className="text-base md:text-lg truncate">
                            {team.team_name}
                          </CardTitle>
                        </div>
                        <p className="text-xs md:text-sm text-muted-foreground truncate">{team.school_name}</p>
                      </div>
                      <Badge variant="outline" className="text-xs ml-2 flex-shrink-0">#{rank}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 md:p-4 pt-0">
                    <div className="space-y-2">
                      {team.domain && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Domain:</span>
                          <Badge variant="secondary" className="text-xs">{team.domain}</Badge>
                        </div>
                      )}
                      {team.stall_no && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                          <span className="text-xs md:text-sm">{team.stall_no}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-xs text-muted-foreground">Score</span>
                        <span className="text-lg md:text-xl font-bold">{team.total_score || 0}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {rankings.map((team: any, index: number) => {
              const rank = index + 1
              const rankIcon = getRankIcon(rank)
              
              return (
                <Card key={team.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-3 md:p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                          {rankIcon || <span className="font-bold text-sm md:text-base">#{rank}</span>}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-sm md:text-base truncate">{team.team_name}</h3>
                            <Badge variant="outline" className="text-xs">#{rank}</Badge>
                          </div>
                          <p className="text-xs md:text-sm text-muted-foreground truncate">{team.school_name}</p>
                          <div className="flex items-center gap-2 md:gap-4 mt-1 flex-wrap">
                            {team.domain && <Badge variant="secondary" className="text-xs">{team.domain}</Badge>}
                            {team.stall_no && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                {team.stall_no}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-lg md:text-xl font-bold">{team.total_score || 0}</div>
                        <div className="text-xs text-muted-foreground">Score</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )
      ) : selectedEvent ? (
        <Card>
          <CardContent className="p-4 md:pt-6">
            <div className="text-center py-6 md:py-8">
              <Trophy className="h-10 w-10 md:h-12 md:w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm md:text-base text-muted-foreground">
                No rankings calculated yet
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4 md:pt-6">
            <div className="text-center py-6 md:py-8">
              <Trophy className="h-10 w-10 md:h-12 md:w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm md:text-base text-muted-foreground">
                Select an event to view rankings
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
