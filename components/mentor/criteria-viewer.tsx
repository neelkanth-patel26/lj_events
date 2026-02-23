'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings2, Award } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function CriteriaViewer() {
    const { data: events } = useSWR('/api/events', fetcher)
    const [selectedEvent, setSelectedEvent] = useState('')
    const [criteria, setCriteria] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (selectedEvent) {
            fetchCriteria()
        }
    }, [selectedEvent])

    const fetchCriteria = async () => {
        if (!selectedEvent) return
        setLoading(true)
        try {
            const res = await fetch(`/api/judging/criteria?eventId=${selectedEvent}`)
            const data = await res.json()
            setCriteria(data.length > 0 ? data : [])
        } catch (error) {
            console.error('Failed to fetch criteria:', error)
            setCriteria([])
        } finally {
            setLoading(false)
        }
    }

    const totalPoints = criteria.reduce((sum, c) => sum + (c.max_score || 0), 0)

    return (
        <Card className="dark:bg-neutral-900 dark:border-neutral-800">
            <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2 dark:text-white">
                            <Settings2 className="h-5 w-5" />
                            Scoring Criteria
                        </CardTitle>
                        <CardDescription className="mt-1.5 dark:text-neutral-400">
                            View the scoring criteria used for evaluation
                        </CardDescription>
                    </div>
                    {selectedEvent && criteria.length > 0 && (
                        <div className="text-right">
                            <div className="text-2xl font-bold dark:text-white">{totalPoints}</div>
                            <div className="text-xs text-muted-foreground dark:text-neutral-400">Total Points</div>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                        <SelectTrigger className="h-11 dark:bg-neutral-800 dark:border-neutral-700 dark:text-white">
                            <SelectValue placeholder="Select an event to view criteria" />
                        </SelectTrigger>
                        <SelectContent className="dark:bg-neutral-800 dark:border-neutral-700">
                            {events?.map((event: any) => (
                                <SelectItem key={event.id} value={event.id} className="dark:text-white dark:focus:bg-neutral-700">
                                    {event.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {selectedEvent && loading && (
                    <div className="space-y-2">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="animate-pulse" style={{ animationDelay: `${i * 100}ms` }}>
                                <div className="flex items-center justify-between p-4 rounded-lg border-2 dark:border-neutral-700 bg-muted/30 dark:bg-neutral-800/50">
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 dark:bg-neutral-700 rounded w-2/3"></div>
                                    </div>
                                    <div className="h-6 w-16 bg-gray-200 dark:bg-neutral-700 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {selectedEvent && !loading && criteria.length > 0 && (
                    <div className="space-y-2">
                        {criteria.map((c, index) => (
                            <div 
                                key={c.id} 
                                className="flex items-center justify-between p-4 rounded-lg border-2 dark:border-neutral-700 bg-muted/30 dark:bg-neutral-800/50 hover:border-gray-400 dark:hover:border-gray-600 transition-all"
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                <div className="flex items-center gap-3 flex-1">
                                    <Award className="h-4 w-4 text-muted-foreground dark:text-neutral-400" />
                                    <p className="font-semibold text-sm dark:text-white">{c.criteria_name}</p>
                                </div>
                                <Badge variant="secondary" className="text-sm font-bold px-3 py-1 dark:bg-neutral-700 dark:text-white">
                                    {c.max_score} pts
                                </Badge>
                            </div>
                        ))}
                    </div>
                )}

                {selectedEvent && !loading && criteria.length === 0 && (
                    <div className="text-center py-8">
                        <Settings2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50 dark:text-neutral-600" />
                        <p className="text-sm text-muted-foreground dark:text-neutral-400">No criteria configured for this event</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
