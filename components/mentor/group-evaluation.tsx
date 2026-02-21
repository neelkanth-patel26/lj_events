'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Users, CheckCircle2, Award, Search, Calendar, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Criterion {
    id: string
    name: string
    maxPoints: number
}

interface Event {
    id: string
    name: string
}

interface Team {
    id: string
    team_name: string
    event_id: string
    team_number?: string
    school_name?: string
    project_name?: string
    description?: string
    member_count?: number
    total_score?: number
    members?: any[]
    stall_no?: string
    domain?: string
    contact_email?: string
    contact_phone?: string
    team_size?: number
}

export function GroupEvaluation({ initialGroups = [] }: { initialGroups?: any[] }) {
    const [events, setEvents] = useState<Event[]>([])
    const [selectedEvent, setSelectedEvent] = useState<string>('')
    const [teams, setTeams] = useState<Team[]>([])
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
    const [criteria, setCriteria] = useState<Criterion[]>([])
    const [scores, setScores] = useState<Record<string, number>>({})
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchEvents()
        fetchCriteria()
    }, [])

    useEffect(() => {
        if (selectedEvent) {
            fetchTeams(selectedEvent)
            setSelectedTeam(null)
            setScores({})
        }
    }, [selectedEvent])

    const fetchEvents = async () => {
        try {
            const res = await fetch('/api/events')
            const data = await res.json()
            setEvents(data || [])
        } catch (error) {
            console.error('Failed to fetch events:', error)
        }
    }

    const fetchTeams = async (eventId: string) => {
        try {
            const res = await fetch(`/api/events/${eventId}/teams`)
            const data = await res.json()
            console.log('Fetched teams:', data)
            
            // Fetch member count for each team
            const teamsWithMembers = await Promise.all(
                (data || []).map(async (team: any) => {
                    try {
                        const membersRes = await fetch(`/api/teams/${team.id}/members`)
                        const members = await membersRes.json()
                        return { ...team, member_count: members?.length || 0, members }
                    } catch {
                        return { ...team, member_count: 0, members: [] }
                    }
                })
            )
            
            setTeams(teamsWithMembers)
        } catch (error) {
            console.error('Failed to fetch teams:', error)
            setTeams([])
        }
    }

    const fetchCriteria = async () => {
        try {
            const res = await fetch('/api/judging/criteria')
            const data = await res.json()
            if (data.length > 0) {
                setCriteria(data.map((c: any) => ({ id: c.id, name: c.name, maxPoints: c.max_points })))
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

    const updateScore = (criterionId: string, value: number) => {
        setScores(prev => ({ ...prev, [criterionId]: value }))
    }

    const calculateTotal = () => {
        return Object.values(scores).reduce((a, b) => a + b, 0)
    }

    const submitScores = async () => {
        if (!selectedTeam) {
            alert('Please select a team')
            return
        }

        setLoading(true)
        try {
            const scoreData = criteria.map(c => ({
                criteriaId: c.id,
                score: scores[c.id] || 0
            }))

            const res = await fetch('/api/judging/scores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ teamId: selectedTeam.id, scores: scoreData })
            })

            const result = await res.json()
            
            if (!res.ok) {
                throw new Error(result.error || 'Failed to submit scores')
            }

            alert('Scores submitted successfully!')
            
            // Update team's total score in local state
            const totalScore = result.totalScore || calculateTotal()
            setTeams(teams.map(t => 
                t.id === selectedTeam.id ? { ...t, total_score: totalScore } : t
            ))
            
            setScores({})
            setSelectedTeam(null)
        } catch (error: any) {
            alert('Failed to submit scores: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const filteredTeams = teams.filter(t => 
        t.team_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.team_number?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const selectedEventData = events.find(e => e.id === selectedEvent)

    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="p-4 space-y-4">
                    <div>
                        <Label>Select Event</Label>
                        <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                            <SelectTrigger className="mt-2">
                                <SelectValue placeholder="Choose an event" />
                            </SelectTrigger>
                            <SelectContent>
                                {events.map(event => (
                                    <SelectItem key={event.id} value={event.id}>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            {event.name}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedEvent && (
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search teams by name or number..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                    )}
                </CardContent>
            </Card>

            {selectedEvent && filteredTeams.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        Teams in {selectedEventData?.name}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredTeams.map((team) => (
                            <Card 
                                key={team.id} 
                                className={`cursor-pointer transition-all hover:shadow-xl hover:scale-[1.02] border-l-4 ${
                                    selectedTeam?.id === team.id 
                                        ? 'ring-2 ring-primary shadow-xl border-l-primary bg-primary/5' 
                                        : 'border-l-gray-300 hover:border-l-primary'
                                }`}
                                onClick={() => {
                                    setSelectedTeam(team)
                                    setScores({})
                                }}
                            >
                                <CardHeader className="pb-3 space-y-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <CardTitle className="text-base mb-2 truncate">{team.team_name}</CardTitle>
                                            <div className="flex flex-wrap gap-1.5">
                                                {team.stall_no && (
                                                    <Badge variant="outline" className="text-[10px] font-semibold px-2 py-0.5">
                                                        Stall {team.stall_no}
                                                    </Badge>
                                                )}
                                                {team.domain && (
                                                    <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                                                        {team.domain}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                                            <Users className="h-5 w-5 text-primary" />
                                        </div>
                                    </div>
                                    {team.total_score !== undefined && team.total_score > 0 && (
                                        <div className="flex items-center justify-between p-2 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg border border-primary/20">
                                            <span className="text-xs font-semibold text-muted-foreground">Current Score</span>
                                            <span className="text-lg font-black text-primary">{team.total_score}</span>
                                        </div>
                                    )}
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {team.school_name && (
                                        <div className="flex items-center gap-2 text-xs">
                                            <div className="h-4 w-4 rounded bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                                            </div>
                                            <span className="font-medium text-muted-foreground truncate">{team.school_name}</span>
                                        </div>
                                    )}
                                    {(team.team_size || team.member_count) && (
                                        <div className="flex items-center gap-2 text-xs">
                                            <div className="h-4 w-4 rounded bg-orange-100 flex items-center justify-center flex-shrink-0">
                                                <div className="h-1.5 w-1.5 rounded-full bg-orange-600" />
                                            </div>
                                            <span className="font-medium text-muted-foreground">{team.team_size || team.member_count} Members</span>
                                        </div>
                                    )}
                                    {team.contact_email && (
                                        <div className="flex items-center gap-2 text-xs">
                                            <div className="h-4 w-4 rounded bg-green-100 flex items-center justify-center flex-shrink-0">
                                                <div className="h-1.5 w-1.5 rounded-full bg-green-600" />
                                            </div>
                                            <span className="font-medium text-muted-foreground truncate">{team.contact_email}</span>
                                        </div>
                                    )}
                                    {team.contact_phone && (
                                        <div className="flex items-center gap-2 text-xs">
                                            <div className="h-4 w-4 rounded bg-purple-100 flex items-center justify-center flex-shrink-0">
                                                <div className="h-1.5 w-1.5 rounded-full bg-purple-600" />
                                            </div>
                                            <span className="font-medium text-muted-foreground">{team.contact_phone}</span>
                                        </div>
                                    )}
                                    {team.members && team.members.length > 0 && (
                                        <div className="pt-2 mt-2 border-t space-y-1.5">
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">Team Members</p>
                                            {team.members.slice(0, 2).map((member: any, idx: number) => (
                                                <div key={idx} className="flex items-center gap-2">
                                                    <div className="h-5 w-5 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center flex-shrink-0">
                                                        <span className="text-[9px] font-bold text-primary">{member.name?.charAt(0) || 'M'}</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[11px] font-semibold truncate">{member.name || 'Member'}</p>
                                                        {member.enrollment_number && (
                                                            <p className="text-[9px] text-muted-foreground truncate">{member.enrollment_number}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            {team.members.length > 2 && (
                                                <p className="text-[10px] text-muted-foreground pl-7">+{team.members.length - 2} more members</p>
                                            )}
                                        </div>
                                    )}
                                    <div className="pt-2">
                                        <Button 
                                            variant={selectedTeam?.id === team.id ? "default" : "outline"} 
                                            size="sm" 
                                            className="w-full font-semibold text-xs h-8"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setSelectedTeam(team)
                                                setScores({})
                                            }}
                                        >
                                            {selectedTeam?.id === team.id ? (
                                                <><CheckCircle2 className="h-3 w-3 mr-1.5" />Selected</>
                                            ) : (
                                                <><Award className="h-3 w-3 mr-1.5" />Evaluate</>
                                            )}
                                        </Button>
                                        {team.total_score !== undefined && team.total_score > 0 && (
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="w-full mt-1.5 text-[10px] h-7"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setSelectedTeam(team)
                                                    setScores({})
                                                }}
                                            >
                                                Edit Score
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {selectedEvent && filteredTeams.length === 0 && (
                <Card>
                    <CardContent className="p-8 text-center text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p>No teams found for this event</p>
                    </CardContent>
                </Card>
            )}

            {selectedTeam && (
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Award className="h-5 w-5 text-primary" />
                                Evaluating: {selectedTeam.team_name}
                            </CardTitle>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedTeam(null)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-4">
                            {criteria.map((criterion) => (
                                <div key={criterion.id} className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <Label className="text-sm font-medium">{criterion.name}</Label>
                                        <span className="text-sm font-bold text-primary">
                                            {scores[criterion.id] || 0} / {criterion.maxPoints}
                                        </span>
                                    </div>
                                    <Input
                                        type="number"
                                        min={0}
                                        max={criterion.maxPoints}
                                        value={scores[criterion.id] || 0}
                                        onChange={(e) => updateScore(criterion.id, Math.min(parseInt(e.target.value) || 0, criterion.maxPoints))}
                                        className="w-full"
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/10">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Score</p>
                                <div className="text-3xl font-black text-primary tabular-nums">
                                    {calculateTotal()} / {criteria.reduce((sum, c) => sum + c.maxPoints, 0)}
                                </div>
                            </div>
                            <Button onClick={submitScores} disabled={loading} className="gap-2">
                                <CheckCircle2 className="h-4 w-4" />
                                {loading ? 'Submitting...' : 'Submit Evaluation'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
