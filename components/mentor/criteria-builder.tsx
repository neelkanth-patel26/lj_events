'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, Settings2, Save, GripVertical } from 'lucide-react'
import { useRealtimeData } from '@/hooks/useRealtimeData'

export function CriteriaBuilder() {
    const [criteria, setCriteria] = useState([
        { id: '1', name: 'Innovation & Creativity', maxPoints: 100 },
        { id: '2', name: 'Technical Implementation', maxPoints: 100 },
        { id: '3', name: 'Presentation & Communication', maxPoints: 100 },
    ])
    const [loading, setLoading] = useState(false)
    const [userRole, setUserRole] = useState<string>('admin')

    useEffect(() => {
        fetchCriteria()
        checkRole()
    }, [])
    
    const handleDataChange = useCallback(() => {
        fetchCriteria()
    }, [])
    
    useRealtimeData(handleDataChange, ['judging_criteria'])

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

    const saveCriteria = async () => {
        setLoading(true)
        try {
            await fetch('/api/judging/criteria', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ criteria })
            })
            alert('Criteria saved successfully!')
        } catch (error) {
            alert('Failed to save criteria')
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

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                    <Settings2 className="h-4 w-4" />
                    Scoring Criteria Configuration
                </CardTitle>
                <CardDescription>
                    {isAdmin ? 'Define evaluation criteria. Each criterion has a maximum of 100 points.' : 'View the scoring criteria used for evaluation.'}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-3">
                    {criteria.map((c, index) => (
                        <div key={c.id} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                            {isAdmin && <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 cursor-grab" />}
                            <div className="flex-1">
                                <Input
                                    placeholder="Criterion Name (e.g., Innovation & Creativity)"
                                    value={c.name}
                                    onChange={(e) => updateCriterion(c.id, 'name', e.target.value)}
                                    className="h-9"
                                    disabled={!isAdmin}
                                />
                            </div>
                            <div className="w-28 relative">
                                <Input
                                    type="number"
                                    placeholder="Max"
                                    value={c.maxPoints || 100}
                                    onChange={(e) => updateCriterion(c.id, 'maxPoints', parseInt(e.target.value) || 100)}
                                    className="h-9 pr-10"
                                    max={100}
                                    disabled={!isAdmin}
                                />
                                <span className="absolute right-3 top-2 text-xs text-muted-foreground">pts</span>
                            </div>
                            {isAdmin && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => removeCriterion(c.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    ))}
                </div>

                {isAdmin && (
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <Button variant="outline" className="flex-1 gap-2" onClick={addCriterion}>
                            <Plus className="h-4 w-4" />
                            Add Criterion
                        </Button>
                        <Button className="flex-1 gap-2" onClick={saveCriteria} disabled={loading}>
                            <Save className="h-4 w-4" />
                            {loading ? 'Saving...' : 'Save Rubric'}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

function Badge({ children, variant, className }: { children: React.ReactNode, variant: string, className?: string }) {
    const styles = variant === 'default'
        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
        : "bg-destructive/10 text-destructive border-destructive/20"

    return (
        <div className={`px-2 py-0.5 rounded-full border text-xs font-bold ${styles} ${className}`}>
            {children}
        </div>
    )
}
