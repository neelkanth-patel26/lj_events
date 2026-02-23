'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2, Settings2, Save, GripVertical } from 'lucide-react'
import { useRealtimeData } from '@/hooks/useRealtimeData'
import useSWR from 'swr'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function CriteriaBuilder() {
    const { data: events } = useSWR('/api/events', fetcher)
    const [selectedEvent, setSelectedEvent] = useState('')
    const [criteria, setCriteria] = useState([
        { id: '1', name: 'Innovation & Creativity', maxPoints: 100 },
        { id: '2', name: 'Technical Implementation', maxPoints: 100 },
        { id: '3', name: 'Presentation & Communication', maxPoints: 100 },
    ])
    const [loading, setLoading] = useState(false)
    const [userRole, setUserRole] = useState<string>('admin')

    useEffect(() => {
        checkRole()
    }, [])
    
    useEffect(() => {
        if (selectedEvent) {
            fetchCriteria()
        }
    }, [selectedEvent])
    
    const handleDataChange = useCallback(() => {
        if (selectedEvent) {
            fetchCriteria()
        }
    }, [selectedEvent])
    
    useRealtimeData(handleDataChange, ['evaluation_criteria'])

    const checkRole = async () => {
        try {
            const res = await fetch('/api/auth/session')
            const data = await res.json()
            setUserRole(data?.user?.role || 'admin')
        } catch {
            setUserRole('admin')
        }
    }

    const fetchCriteria = async () => {
        if (!selectedEvent) return
        try {
            const res = await fetch(`/api/judging/criteria?eventId=${selectedEvent}`)
            const data = await res.json()
            if (data.length > 0) {
                setCriteria(data.map((c: any) => ({ id: c.id, name: c.criteria_name, maxPoints: c.max_score })))
            } else {
                setCriteria([
                    { id: '1', name: 'Innovation & Creativity', maxPoints: 100 },
                    { id: '2', name: 'Technical Implementation', maxPoints: 100 },
                    { id: '3', name: 'Presentation & Communication', maxPoints: 100 },
                ])
            }
        } catch (error) {
            console.error('Failed to fetch criteria:', error)
        }
    }

    const saveCriteria = async () => {
        if (!selectedEvent) {
            alert('Please select an event first')
            return
        }
        setLoading(true)
        try {
            const response = await fetch('/api/judging/criteria', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventId: selectedEvent, criteria })
            })
            
            const result = await response.json()
            
            if (!response.ok) {
                throw new Error(result.error || 'Failed to save criteria')
            }
            
            alert('Criteria saved successfully!')
            fetchCriteria()
        } catch (error: any) {
            console.error('Save error:', error)
            alert('Failed to save criteria: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const addCriterion = () => {
        setCriteria([...criteria, { id: Date.now().toString(), name: '', maxPoints: 100 }])
    }

    const removeCriterion = (id: string) => {
        setCriteria(criteria.filter(c => c.id !== id))
    }

    const updateCriterion = (id: string, field: 'name' | 'maxPoints', value: string | number) => {
        setCriteria(criteria.map(c => c.id === id ? { ...c, [field]: value } : c))
    }

    const isAdmin = userRole === 'admin'

    const totalPoints = criteria.reduce((sum, c) => sum + (c.maxPoints || 0), 0)

    return (
        <Card className="dark:bg-neutral-900 dark:border-neutral-800">
            <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle className="text-lg flex items-center gap-2 dark:text-white">
                            <Settings2 className="h-5 w-5" />
                            Scoring Criteria Configuration
                        </CardTitle>
                        <CardDescription className="mt-1.5 dark:text-neutral-400">
                            {isAdmin ? 'Define evaluation criteria for each event' : 'View the scoring criteria used for evaluation'}
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
                            <SelectValue placeholder="Select an event to configure criteria" />
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
                
                {selectedEvent && (
                    <>
                        <div className="space-y-2">
                            {criteria.map((c, index) => (
                                <div 
                                    key={c.id} 
                                    className="flex items-center gap-2 p-3 rounded-lg border-2 dark:border-neutral-700 bg-muted/30 dark:bg-neutral-800/50 hover:border-gray-400 dark:hover:border-gray-600 transition-all"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    {isAdmin && <GripVertical className="h-4 w-4 text-muted-foreground dark:text-neutral-500 shrink-0 cursor-grab" />}
                                    <div className="flex-1 min-w-0">
                                        <Input
                                            placeholder="Criterion name (e.g., Innovation & Creativity)"
                                            value={c.name}
                                            onChange={(e) => updateCriterion(c.id, 'name', e.target.value)}
                                            className="h-10 border-0 bg-transparent focus-visible:ring-1 dark:text-white placeholder:text-muted-foreground/60"
                                            disabled={!isAdmin}
                                        />
                                    </div>
                                    <div className="w-24 relative shrink-0">
                                        <Input
                                            type="number"
                                            placeholder="100"
                                            value={c.maxPoints || ''}
                                            onChange={(e) => updateCriterion(c.id, 'maxPoints', parseInt(e.target.value) || 100)}
                                            className="h-10 pr-9 text-center font-semibold dark:bg-neutral-900 dark:border-neutral-600 dark:text-white"
                                            max={100}
                                            disabled={!isAdmin}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground dark:text-neutral-400">pts</span>
                                    </div>
                                    {isAdmin && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-10 w-10 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20"
                                            onClick={() => removeCriterion(c.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>

                        {isAdmin && (
                            <div className="flex flex-col sm:flex-row gap-2 pt-2">
                                <Button variant="outline" className="flex-1 h-11 gap-2" onClick={addCriterion}>
                                    <Plus className="h-4 w-4" />
                                    Add Criterion
                                </Button>
                                <Button className="flex-1 h-11 gap-2" onClick={saveCriteria} disabled={loading}>
                                    <Save className="h-4 w-4" />
                                    {loading ? 'Saving...' : 'Save Criteria'}
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    )
}
