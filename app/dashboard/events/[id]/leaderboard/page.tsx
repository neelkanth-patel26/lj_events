'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trophy, ArrowLeft, Users } from 'lucide-react'
import { useParams } from 'next/navigation'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url, { cache: 'no-store' }).then(r => r.json())

export default function EventLeaderboardPage() {
  const params = useParams()
  const eventId = params.id

  const { data: event } = useSWR(`/api/events/${eventId}`, fetcher)
  const { data: rankings } = useSWR(`/api/leaderboard?eventId=${eventId}`, fetcher)

  if (!event) return <div className="p-8 text-center">Loading...</div>

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => window.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{event.name} - Leaderboard</h1>
          <p className="text-muted-foreground">{new Date(event.event_date).toLocaleDateString()}</p>
        </div>
      </div>

      {rankings && rankings.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Rankings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {rankings.map((team: any, index: number) => (
                <div key={team.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{team.team_name}</p>
                      <p className="text-sm text-muted-foreground">{team.school_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">{team.total_score || 0}</p>
                    <Badge variant={index < 3 ? 'default' : 'outline'}>#{index + 1}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No rankings available for this event</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}