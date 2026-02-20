'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Plus, Trash2, Settings2, Save, GripVertical } from 'lucide-react'

export function CriteriaBuilder() {
    const [criteria, setCriteria] = useState([
        { id: '1', name: 'UI/UX Design', weight: 25 },
        { id: '2', name: 'Technical Complexity', weight: 35 },
        { id: '3', name: 'Innovation', weight: 40 },
    ])

    const addCriterion = () => {
        setCriteria([...criteria, { id: Date.now().toString(), name: '', weight: 0 }])
    }

    const removeCriterion = (id: string) => {
        setCriteria(criteria.filter(c => c.id !== id))
    }

    const updateCriterion = (id: string, field: 'name' | 'weight', value: string | number) => {
        setCriteria(criteria.map(c => c.id === id ? { ...c, [field]: value } : c))
    }

    const totalWeight = criteria.reduce((sum, c) => sum + Number(c.weight), 0)

    return (
        <Card className="border-primary/20">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-xl flex items-center gap-2">
                            <Settings2 className="h-5 w-5 text-primary" />
                            Custom Judging Rubric
                        </CardTitle>
                        <CardDescription>
                            Define your evaluation parameters and their weightage.
                        </CardDescription>
                    </div>
                    <Badge variant={totalWeight === 100 ? "default" : "destructive"} className="h-6">
                        Total: {totalWeight}%
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-3">
                    {criteria.map((c, index) => (
                        <div key={c.id} className="flex items-center gap-3 animate-in slide-in-from-right-2 duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                            <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 cursor-grab" />
                            <div className="flex-1">
                                <Input
                                    placeholder="Criterion Name (e.g., Code Quality)"
                                    value={c.name}
                                    onChange={(e) => updateCriterion(c.id, 'name', e.target.value)}
                                    className="h-9 focus:ring-primary"
                                />
                            </div>
                            <div className="w-24 relative">
                                <Input
                                    type="number"
                                    placeholder="Weight"
                                    value={c.weight}
                                    onChange={(e) => updateCriterion(c.id, 'weight', parseInt(e.target.value) || 0)}
                                    className="h-9 pr-7 focus:ring-primary"
                                />
                                <span className="absolute right-2.5 top-2 text-xs text-muted-foreground">%</span>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                onClick={() => removeCriterion(c.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button variant="outline" className="flex-1 gap-2" onClick={addCriterion}>
                        <Plus className="h-4 w-4" />
                        Add Criterion
                    </Button>
                    <Button className="flex-1 gap-2 bg-primary">
                        <Save className="h-4 w-4" />
                        Save Rubric
                    </Button>
                </div>

                {totalWeight !== 100 && (
                    <p className="text-[10px] text-destructive font-medium text-center">
                        * Total weight must equal 100% to save the rubric.
                    </p>
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
