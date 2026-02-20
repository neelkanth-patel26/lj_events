'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Trophy, Medal, Star, TrendingUp, Search } from 'lucide-react'
import { useState, useEffect } from 'react'

interface Ranking {
    id: string
    name: string
    score: number
    domain: string
    stall: string
    rank: number
}

export function LeaderboardClient({ initialRankings }: { initialRankings: Ranking[] }) {
    const [searchTerm, setSearchTerm] = useState('')
    const [rankings] = useState<Ranking[]>(initialRankings)

    const filteredRankings = rankings.filter(r =>
        r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.domain?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-2 text-center md:text-left">
                <h2 className="text-3xl font-bold tracking-tight text-primary flex items-center justify-center md:justify-start gap-3">
                    <Trophy className="h-8 w-8 text-amber-500" />
                    Project Standings
                </h2>
                <p className="text-muted-foreground max-w-2xl">
                    Real-time rankings based on judge evaluations across all criteria.
                </p>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search projects or domains..."
                                className="w-full bg-card border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Badge variant="outline" className="h-10 px-4 flex gap-2 font-mono">
                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                            LIVE
                        </Badge>
                    </div>

                    <div className="grid gap-3">
                        {filteredRankings.map((project) => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
                    </div>
                </div>

                <div className="w-full md:w-80 space-y-6">
                    <TopThreeSummary rankings={rankings} />
                </div>
            </div>
        </div>
    )
}

function ProjectCard({ project }: { project: Ranking }) {
    const isTopThree = project.rank <= 3

    return (
        <Card className={`overflow-hidden transition-all hover:shadow-md ${isTopThree ? 'border-amber-500/20 bg-amber-500/5' : ''}`}>
            <CardContent className="p-4 flex items-center gap-4">
                <div className={`h-10 w-10 shrink-0 flex items-center justify-center rounded-lg font-bold text-lg ${project.rank === 1 ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' :
                    project.rank === 2 ? 'bg-slate-300 text-slate-700' :
                        project.rank === 3 ? 'bg-amber-700 text-amber-50' :
                            'bg-muted text-muted-foreground'
                    }`}>
                    {project.rank}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-sm truncate">{project.name}</h3>
                        {project.rank === 1 && <Star className="h-3 w-3 fill-amber-500 text-amber-500" />}
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold flex items-center gap-2">
                        {project.domain}
                        <span>•</span>
                        Stall {project.stall}
                    </p>
                </div>

                <div className="text-right shrink-0">
                    <p className="text-lg font-black text-primary tabular-nums">{project.score}</p>
                    <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter">Avg Score</p>
                </div>
            </CardContent>
        </Card>
    )
}

function TopThreeSummary({ rankings }: { rankings: Ranking[] }) {
    const podium = rankings.slice(0, 3)
    const [lastUpdated, setLastUpdated] = useState<string>('')

    useEffect(() => {
        setLastUpdated(new Date().toLocaleTimeString())
    }, [])

    return (
        <Card className="bg-primary text-primary-foreground overflow-hidden">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-wider opacity-90">Hall of Fame</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {podium.map((p, i) => (
                    <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/10 backdrop-blur-sm">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${i === 0 ? 'bg-amber-400 text-amber-900' :
                            i === 1 ? 'bg-slate-200 text-slate-800' :
                                'bg-amber-800 text-amber-100'
                            }`}>
                            <Medal className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold truncate">{p.name}</p>
                            <p className="text-[10px] opacity-70 truncate">{p.domain}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-black">{p.score}</p>
                        </div>
                    </div>
                ))}
                {lastUpdated && (
                    <div className="pt-2">
                        <p className="text-[9px] text-center opacity-60 uppercase tracking-widest font-bold">
                            Last Updated: {lastUpdated}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
