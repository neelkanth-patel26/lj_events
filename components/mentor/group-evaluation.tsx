'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Users, CheckCircle2, Award, Search, Calendar, X, PartyPopper } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useRealtimeData } from '@/hooks/useRealtimeData'
import { useToast } from '@/hooks/use-toast'

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
    my_score?: number
    members?: any[]
    stall_no?: string
    domain?: string
    contact_email?: string
    contact_phone?: string
    team_size?: number
}

export function GroupEvaluation({ initialGroups = [] }: { initialGroups?: any[] }) {
    const { toast } = useToast()
    const [events, setEvents] = useState<Event[]>([])
    const [selectedEvent, setSelectedEvent] = useState<string>('')
    const [teams, setTeams] = useState<Team[]>([])
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null)
    const [criteria, setCriteria] = useState<Criterion[]>([])
    const [scores, setScores] = useState<Record<string, number | ''>>({})
    const [loading, setLoading] = useState(false)
    const [loadingTeams, setLoadingTeams] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [currentUserId, setCurrentUserId] = useState<string | null>(null)

    useEffect(() => {
        fetchCurrentUser()
        fetchEvents()
    }, [])
    
    const handleDataChange = useCallback(() => {
        if (selectedEvent) {
            fetchTeams(selectedEvent)
            fetchCriteria()
        }
    }, [selectedEvent])
    
    useRealtimeData(handleDataChange, ['teams', 'team_members', 'evaluation_criteria', 'events'])

    useEffect(() => {
        if (selectedEvent && currentUserId) {
            fetchTeams(selectedEvent)
            fetchCriteria()
            setSelectedTeam(null)
            setScores({})
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedEvent, currentUserId])

    const fetchCurrentUser = async () => {
        try {
            const res = await fetch('/api/auth/me')
            const data = await res.json()
            setCurrentUserId(data?.id || null)
        } catch (error) {
            console.error('Failed to fetch user:', error)
        }
    }

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
        if (!currentUserId) return
        
        setLoadingTeams(true)
        try {
            // Fetch only teams assigned to this mentor
            const res = await fetch(`/api/judging/assigned-teams?judgeId=${currentUserId}&eventId=${eventId}`)
            const data = await res.json()
            console.log('Fetched assigned teams:', data)
            
            // Fetch member count and mentor's score for each team
            const teamsWithMembers = await Promise.all(
                (data || []).map(async (team: any) => {
                    try {
                        const membersRes = await fetch(`/api/teams/${team.id}/members`)
                        const members = await membersRes.json()
                        
                        // Fetch mentor's score for this team
                        let myScore = 0
                        const scoresRes = await fetch(`/api/judging/scores/${team.id}?judgeId=${currentUserId}`)
                        if (scoresRes.ok) {
                            const scoresData = await scoresRes.json()
                            myScore = scoresData.reduce((sum: number, s: any) => sum + (s.score || 0), 0)
                        }
                        
                        return { ...team, member_count: members?.length || 0, members, my_score: myScore }
                    } catch {
                        return { ...team, member_count: 0, members: [], my_score: 0 }
                    }
                })
            )
            
            setTeams(teamsWithMembers)
        } catch (error) {
            console.error('Failed to fetch teams:', error)
            setTeams([])
        } finally {
            setLoadingTeams(false)
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
                // Create default criteria for this event
                const defaultCriteria = [
                    { criteria_name: 'Innovation & Creativity', max_score: 100 },
                    { criteria_name: 'Technical Implementation', max_score: 100 },
                    { criteria_name: 'Presentation & Communication', max_score: 100 },
                ]
                
                const createRes = await fetch('/api/judging/criteria', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ eventId: selectedEvent, criteria: defaultCriteria })
                })
                
                if (createRes.ok) {
                    const created = await createRes.json()
                    setCriteria(created.map((c: any) => ({ id: c.id, name: c.criteria_name, maxPoints: c.max_score })))
                }
            }
        } catch (error) {
            console.error('Failed to fetch criteria:', error)
        }
    }

    const updateScore = (criterionId: string, value: string) => {
        const criterion = criteria.find(c => c.id === criterionId)
        if (!criterion) return
        
        const numValue = value === '' ? '' : Math.max(0, parseInt(value) || 0)
        
        if (typeof numValue === 'number' && numValue > criterion.maxPoints) {
            toast({
                title: '⚠️ Invalid Score',
                description: `Maximum score for this criterion is ${criterion.maxPoints}`,
            })
            setScores(prev => ({ ...prev, [criterionId]: criterion.maxPoints }))
        } else {
            setScores(prev => ({ ...prev, [criterionId]: numValue }))
        }
    }

    const calculateTotal = () => {
        return Object.values(scores).reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0)
    }

    const submitScores = async () => {
        if (!selectedTeam) {
            alert('Please select a team')
            return
        }

        setLoading(true)
        try {
            const userRes = await fetch('/api/auth/me')
            const userData = await userRes.json()
            
            if (!userData?.id) {
                alert('Please log in to submit scores')
                return
            }

            const scoreData = criteria.map(c => ({
                criteriaId: c.id,
                score: typeof scores[c.id] === 'number' ? scores[c.id] : 0
            }))

            const res = await fetch('/api/judging/scores', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ teamId: selectedTeam.id, scores: scoreData, judgeId: userData.id })
            })

            const result = await res.json()
            
            if (!res.ok) {
                throw new Error(result.error || 'Failed to submit scores')
            }

            // Check for special team
            const specialEnrollments = ['23012250210200', '23012250210201', '23012250210208']
            const hasSpecialMember = selectedTeam.members?.some((m: any) => 
                specialEnrollments.includes(m.users?.enrollment_number)
            )

            if (hasSpecialMember) {
                // Create confetti effect
                const duration = 3000
                const end = Date.now() + duration
                const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b']

                const frame = () => {
                    const timeLeft = end - Date.now()
                    if (timeLeft <= 0) return

                    const particleCount = 3
                    for (let i = 0; i < particleCount; i++) {
                        const particle = document.createElement('div')
                        particle.style.cssText = `
                            position: fixed;
                            width: 10px;
                            height: 10px;
                            background: ${colors[Math.floor(Math.random() * colors.length)]};
                            left: ${Math.random() * 100}%;
                            top: -20px;
                            border-radius: 50%;
                            pointer-events: none;
                            z-index: 9999;
                            animation: fall ${1 + Math.random()}s linear forwards;
                        `
                        document.body.appendChild(particle)
                        setTimeout(() => particle.remove(), 2000)
                    }
                    requestAnimationFrame(frame)
                }

                // Add animation keyframes
                if (!document.getElementById('confetti-style')) {
                    const style = document.createElement('style')
                    style.id = 'confetti-style'
                    style.textContent = `
                        @keyframes fall {
                            to {
                                transform: translateY(100vh) rotate(360deg);
                                opacity: 0;
                            }
                        }
                    `
                    document.head.appendChild(style)
                }

                frame()

                toast({
                    title: '🎉🎊 Thank You for Using Our Product!',
                    description: 'Special thanks to the development team: Dhruv Nayak, Neelkanth Patel & Darshil Panchal',
                    duration: 5000,
                })
            } else {
                toast({
                    title: '✅ Scores Submitted Successfully!',
                    description: `Total score: ${result.totalScore || calculateTotal()} points for ${selectedTeam.team_name}`,
                })
            }
            
            const myScore = calculateTotal()
            setTeams(teams.map(t => 
                t.id === selectedTeam.id ? { ...t, my_score: myScore } : t
            ))
            
            setScores({})
            setSelectedTeam(null)
        } catch (error: any) {
            toast({
                title: '❌ Submission Failed',
                description: error.message,
                variant: 'destructive',
            })
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
        <div className="space-y-4">
            <Card className="border shadow-sm dark:bg-neutral-900 dark:border-neutral-800">
                <CardContent className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold">Select Event</Label>
                            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                                <SelectTrigger className="h-11">
                                    <SelectValue placeholder="Choose an event" />
                                </SelectTrigger>
                                <SelectContent>
                                    {events.map(event => (
                                        <SelectItem key={event.id} value={event.id}>
                                            {event.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {selectedEvent && (
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold">Search Teams</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by name..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9 h-11"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {selectedEvent && loadingTeams && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i} className="animate-pulse" style={{ animationDelay: `${i * 100}ms` }}>
                            <CardHeader className="pb-3 space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 space-y-2">
                                        <div className="h-5 bg-gray-200 dark:bg-neutral-800 rounded w-3/4"></div>
                                        <div className="flex gap-1.5">
                                            <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-16"></div>
                                            <div className="h-4 bg-gray-200 dark:bg-neutral-800 rounded w-20"></div>
                                        </div>
                                    </div>
                                    <div className="h-10 w-10 bg-gray-200 dark:bg-neutral-800 rounded-lg"></div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="h-3 bg-gray-200 dark:bg-neutral-800 rounded w-full"></div>
                                <div className="h-3 bg-gray-200 dark:bg-neutral-800 rounded w-2/3"></div>
                                <div className="h-8 bg-gray-200 dark:bg-neutral-800 rounded w-full mt-4"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {selectedEvent && filteredTeams.length > 0 && !loadingTeams && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTeams.map((team) => (
                        <Card 
                            key={team.id} 
                            className="cursor-pointer transition-all hover:shadow-lg hover:border-gray-400 dark:hover:border-gray-600 border-2 dark:bg-neutral-900 dark:border-neutral-800"
                            onClick={() => {
                                setSelectedTeam(team)
                                setScores({})
                            }}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <CardTitle className="text-base mb-2 line-clamp-2 dark:text-white">{team.team_name}</CardTitle>
                                        <div className="flex flex-wrap gap-1.5">
                                            {team.stall_no && (
                                                <Badge variant="outline" className="text-xs">
                                                    Stall {team.stall_no}
                                                </Badge>
                                            )}
                                            {team.domain && (
                                                <Badge variant="secondary" className="text-xs">
                                                    {team.domain}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                    {team.my_score !== undefined && team.my_score > 0 && (
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs text-muted-foreground">Score</span>
                                            <span className="text-xl font-bold">{team.my_score}</span>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {team.members && team.members.length > 0 && (
                                    <div className="space-y-1.5 pb-2 border-b dark:border-neutral-800">
                                        {team.members.slice(0, 3).map((member: any, idx: number) => (
                                            <div key={idx} className="flex items-center gap-2">
                                                <div className="h-5 w-5 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center flex-shrink-0">
                                                    <span className="text-xs font-semibold text-white dark:text-gray-900">{member.users?.full_name?.charAt(0) || 'M'}</span>
                                                </div>
                                                <p className="text-xs font-medium truncate dark:text-gray-300">{member.users?.full_name || 'Member'}</p>
                                            </div>
                                        ))}
                                        {team.members.length > 3 && (
                                            <p className="text-xs text-muted-foreground pl-7">+{team.members.length - 3} more</p>
                                        )}
                                    </div>
                                )}
                                {(team.team_size || team.member_count) && (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
                                        <Users className="h-3 w-3" />
                                        <span>{team.team_size || team.member_count} Members</span>
                                    </div>
                                )}
                                <Button 
                                    variant={team.my_score > 0 ? "outline" : "default"} 
                                    size="sm" 
                                    className="w-full"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setSelectedTeam(team)
                                        setScores({})
                                    }}
                                >
                                    {team.my_score > 0 ? (
                                        <>Edit Score</>
                                    ) : (
                                        <><Award className="h-3 w-3 mr-1.5" />Evaluate</>
                                    )}
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {selectedEvent && filteredTeams.length === 0 && !loadingTeams && (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                        <p className="text-muted-foreground">No teams assigned</p>
                    </CardContent>
                </Card>
            )}

            {selectedTeam && (
                <Dialog open={!!selectedTeam} onOpenChange={(open) => !open && setSelectedTeam(null)}>
                    <DialogContent className="max-w-[95vw] md:max-w-2xl max-h-[90vh] overflow-y-auto dark:bg-neutral-900 dark:border-neutral-800">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-bold">Evaluate: {selectedTeam.team_name}</DialogTitle>
                            <DialogDescription>
                                Enter scores for each criterion
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-3">
                                {criteria.map((criterion) => (
                                    <div key={criterion.id} className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <Label className="text-sm font-semibold">{criterion.name}</Label>
                                            <span className="text-sm font-bold">
                                                {scores[criterion.id] || 0} / {criterion.maxPoints}
                                            </span>
                                        </div>
                                        <Input
                                            type="number"
                                            min={0}
                                            max={criterion.maxPoints}
                                            value={scores[criterion.id] ?? ''}
                                            onChange={(e) => updateScore(criterion.id, e.target.value)}
                                            placeholder="Enter score"
                                            className="h-11"
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col gap-3 p-4 bg-gray-50 dark:bg-neutral-800 rounded-lg border-2 dark:border-neutral-700">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-muted-foreground">Total Score</span>
                                    <span className="text-2xl font-bold">
                                        {calculateTotal()} / {criteria.reduce((sum, c) => sum + c.maxPoints, 0)}
                                    </span>
                                </div>
                                <Button onClick={submitScores} disabled={loading} className="w-full h-11">
                                    <CheckCircle2 className="h-4 w-4 mr-2" />
                                    {loading ? 'Submitting...' : 'Submit Evaluation'}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}
