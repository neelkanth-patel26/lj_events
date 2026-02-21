'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Settings2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export function CriteriaViewer() {
    const [criteria, setCriteria] = useState([
        { id: '1', name: 'Innovation & Creativity', maxPoints: 100 },
        { id: '2', name: 'Technical Implementation', maxPoints: 100 },
        { id: '3', name: 'Presentation & Communication', maxPoints: 100 },
    ])

    useEffect(() => {
        fetchCriteria()
    }, [])

    const fetchCriteria = async () => {
        try {
            const res = await fetch('/api/judging/criteria')
            const data = await res.json()
            if (data.length > 0) {
                setCriteria(data.map((c: any) => ({ id: c.id, name: c.name, maxPoints: c.max_points })))
            }
        } catch (error) {
            console.error('Failed to fetch criteria:', error)
        }
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    <Settings2 className="h-4 w-4" />
                    Scoring Criteria
                </CardTitle>
                <CardDescription>
                    View the scoring criteria used for evaluation.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {criteria.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
                        <div className="flex-1">
                            <p className="font-semibold text-sm">{c.name}</p>
                        </div>
                        <Badge variant="secondary" className="text-sm font-bold">
                            {c.maxPoints} pts
                        </Badge>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
