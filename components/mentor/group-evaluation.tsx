'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import {
    Users,
    MapPin,
    Code2,
    ChevronRight,
    CheckCircle2,
    Award,
    Info
} from 'lucide-react'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"

import { Label } from '@/components/ui/label'

interface Group {
    id: string
    name: string
    stallNo: string
    domain: string
    status: string
    members: { name: string; enrollment: string }[]
}

export function GroupEvaluation({ initialGroups = [] }: { initialGroups?: Group[] }) {
    const [groups] = useState<Group[]>(initialGroups)
    const [scores, setScores] = useState<Record<string, Record<string, number>>>({})

    const updateScore = (groupId: string, criterion: string, val: number) => {
        setScores(prev => ({
            ...prev,
            [groupId]: { ...prev[groupId], [criterion]: val }
        }))
    }

    const calculateTotal = (groupId: string) => {
        const groupScores = scores[groupId] || {}
        const total = Object.values(groupScores).reduce((a, b) => a + b, 0)
        return total
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2">
                <Award className="h-6 w-6 text-primary" />
                <h2 className="text-xl font-bold">Assigned Groups</h2>
            </div>

            <div className="grid gap-4">
                {groups.map((group) => (
                    <Card key={group.id} className="overflow-hidden border-l-4 border-l-primary">
                        <CardContent className="p-0">
                            <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-6">
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-lg font-bold text-primary mb-1">{group.name}</h3>
                                            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded">
                                                    <MapPin className="h-3 w-3" />
                                                    Stall {group.stallNo}
                                                </span>
                                                <span className="flex items-center gap-1 bg-muted px-2 py-0.5 rounded">
                                                    <Code2 className="h-3 w-3" />
                                                    {group.domain}
                                                </span>
                                            </div>
                                        </div>

                                        <Sheet>
                                            <SheetTrigger asChild>
                                                <Button variant="outline" size="sm" className="gap-2">
                                                    <Users className="h-4 w-4" />
                                                    <span className="hidden sm:inline">Team</span>
                                                </Button>
                                            </SheetTrigger>
                                            <SheetContent>
                                                <SheetHeader>
                                                    <SheetTitle className="text-primary">{group.name} - Team Members</SheetTitle>
                                                    <SheetDescription>
                                                        Detailed breakdown of the 6 core members.
                                                    </SheetDescription>
                                                </SheetHeader>
                                                <div className="mt-6 space-y-4">
                                                    {group.members.map((member) => (
                                                        <div key={member.enrollment} className="flex items-center justify-between p-3 border rounded-lg bg-card shadow-sm">
                                                            <div>
                                                                <p className="text-sm font-bold capitalize">{member.name}</p>
                                                                <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">{member.enrollment}</p>
                                                            </div>
                                                            <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center">
                                                                <Users className="h-3.5 w-3.5 text-primary/40" />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </SheetContent>
                                        </Sheet>
                                    </div>

                                    <div className="space-y-4 pt-2">
                                        {['UI/UX', 'Technical', 'Innovation'].map((crit) => (
                                            <div key={crit} className="space-y-2">
                                                <div className="flex justify-between text-xs font-medium">
                                                    <Label>{crit}</Label>
                                                    <span className="text-primary font-bold">{scores[group.id]?.[crit] || 0}/10</span>
                                                </div>
                                                <Slider
                                                    max={10}
                                                    step={1}
                                                    value={[scores[group.id]?.[crit] || 0]}
                                                    onValueChange={(val) => updateScore(group.id, crit, val[0])}
                                                    className="py-1 [&>span:first-child]:h-1.5 [&_[role=slider]]:h-4 [&_[role=slider]]:w-4 [&_[role=slider]]:border-primary"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="w-full sm:w-48 flex flex-col items-center justify-center p-6 bg-primary/5 rounded-xl border border-primary/10 gap-2 shrink-0">
                                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Final Score</p>
                                    <div className="text-5xl font-black text-primary tabular-nums">
                                        {calculateTotal(group.id)}
                                    </div>
                                    <p className="text-[10px] text-muted-foreground">Auto-calculated total</p>
                                    <Button className="w-full mt-4 gap-2 h-9 bg-primary">
                                        <CheckCircle2 className="h-4 w-4" />
                                        Submit
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
