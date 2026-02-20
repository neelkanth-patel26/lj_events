'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Activity,
    CheckCircle2,
    Clock,
    ArrowRight,
    User,
    Layout
} from 'lucide-react'

interface GradingEvent {
    id: string
    mentor: string
    group: string
    status: 'completed' | 'in_progress'
    time: string
    type: string
}

export function MonitoringFeed({ initialEvents = [] }: { initialEvents?: GradingEvent[] }) {
    const [events] = useState<GradingEvent[]>(initialEvents)
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between py-4">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary animate-pulse" />
                    Live Grading Status
                </CardTitle>
                <Badge variant="outline" className="font-mono text-[10px]">
                    REAL-TIME
                </Badge>
            </CardHeader>
            <CardContent className="px-0">
                <div className="space-y-0">
                    {events.map((event, i) => (
                        <div
                            key={event.id}
                            className={`px-4 py-3 flex items-start gap-3 ${i !== events.length - 1 ? 'border-b' : ''
                                }`}
                        >
                            <div className="mt-0.5">
                                {event.status === 'completed' ? (
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                ) : (
                                    <Clock className="h-4 w-4 text-amber-500" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium leading-none mb-1">
                                    <span className="text-primary">{event.mentor}</span>
                                    <span className="text-muted-foreground font-normal mx-2">{event.type}</span>
                                    <span>{event.group}</span>
                                </p>
                                <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-2.5 w-2.5" />
                                    {event.time}
                                </p>
                            </div>
                            <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0 self-center" />
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
