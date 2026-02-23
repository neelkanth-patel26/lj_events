'use server'

import { createClient } from '@/lib/supabase/server'

export async function getEventStats() {
    const supabase = await createClient()

    try {
        const { data: events } = await supabase.from('events').select('id', { count: 'exact' })
        const { data: mentors } = await supabase.from('users').select('id', { count: 'exact' }).eq('role', 'mentor')
        const { data: teams } = await supabase.from('teams').select('id', { count: 'exact' })
        const { data: scores } = await supabase.from('scores').select('id', { count: 'exact' })

        return [
            { label: 'Total Events', value: events?.length?.toString() || '0', description: 'Active & Upcoming' },
            { label: 'Mentors', value: mentors?.length?.toString() || '0', description: 'Assigned to domains' },
            { label: 'Groups', value: teams?.length?.toString() || '0', description: 'Participating teams' },
            { label: 'Graded', value: scores?.length ? `${Math.round((scores.length / (teams?.length || 1)) * 100)}%` : '0%', description: 'Overall completion' },
        ]
    } catch (err) {
        return []
    }
}

export async function getEventById(eventId: string) {
    const supabase = await createClient()
    
    try {
        const { data, error } = await supabase
            .from('events')
            .select(`
                *,
                teams (
                    id,
                    team_name,
                    domain,
                    stall_no,
                    team_size,
                    total_score
                ),
                evaluation_criteria (
                    id,
                    criteria_name,
                    max_score,
                    weight
                )
            `)
            .eq('id', eventId)
            .single()
            
        if (error) throw error
        return data
    } catch (err) {
        return null
    }
}

export async function updateEventStatus(eventId: string, status: string) {
    const supabase = await createClient()
    
    try {
        const { data, error } = await supabase
            .from('events')
            .update({ 
                status,
                updated_at: new Date().toISOString()
            })
            .eq('id', eventId)
            .select()
            .single()
            
        if (error) throw error
        return { success: true, data }
    } catch (err) {
        return { success: false, error: err }
    }
}

export async function getEventAnalytics(eventId: string) {
    const supabase = await createClient()
    
    try {
        // Get team distribution by domain
        const { data: domainStats } = await supabase
            .from('teams')
            .select('domain')
            .eq('event_id', eventId)
            
        // Get judging progress
        const { data: judgingStats } = await supabase
            .from('team_judges')
            .select('status, teams!inner(event_id)')
            .eq('teams.event_id', eventId)
            
        // Get submission stats
        const { data: submissionStats } = await supabase
            .from('submissions')
            .select('status')
            .eq('event_id', eventId)
            
        const domainDistribution = domainStats?.reduce((acc: any, team: any) => {
            acc[team.domain] = (acc[team.domain] || 0) + 1
            return acc
        }, {}) || {}
        
        const judgingProgress = judgingStats?.reduce((acc: any, judge: any) => {
            acc[judge.status] = (acc[judge.status] || 0) + 1
            return acc
        }, {}) || {}
        
        const submissionProgress = submissionStats?.reduce((acc: any, sub: any) => {
            acc[sub.status] = (acc[sub.status] || 0) + 1
            return acc
        }, {}) || {}
        
        return {
            domainDistribution,
            judgingProgress,
            submissionProgress
        }
    } catch (err) {
        return {
            domainDistribution: {},
            judgingProgress: {},
            submissionProgress: {}
        }
    }
}

export async function getAssignedGroups() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // Get user from users table to get the actual user ID
    const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single()

    if (!userData) return []

    const { data, error } = await supabase
        .from('team_judges')
        .select(`
      status,
      teams (
        id,
        team_name,
        stall_no,
        domain,
        team_members (
          users (
            full_name,
            email
          )
        )
      )
    `)
        .eq('judge_id', userData.id)

    if (error || !data) {
        console.error('Error fetching assigned groups:', error)
        return []
    }

    return data.map(assignment => {
        const team = Array.isArray(assignment.teams) ? assignment.teams[0] : assignment.teams
        return {
            id: team.id,
            name: team.team_name,
            stallNo: team.stall_no,
            domain: team.domain,
            status: assignment.status,
            members: team.team_members.map((m: any) => ({
                name: m.users.full_name,
                enrollment: m.users.email.split('@')[0]
            }))
        }
    })
}

export async function getGradingEvents() {
    try {
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('team_judges')
            .select(`
                id,
                status,
                updated_at,
                teams (
                    team_name
                ),
                users:judge_id (
                    full_name
                )
            `)
            .order('updated_at', { ascending: false })
            .limit(10)

        if (error || !data) return []

        return data.map(event => {
            const team = Array.isArray(event.teams) ? event.teams[0] : event.teams
            const mentor = Array.isArray((event as any).users) ? (event as any).users[0] : (event as any).users

            return {
                id: event.id,
                mentor: mentor?.full_name || 'Unknown Mentor',
                group: team?.team_name || 'Unknown Team',
                status: (event.status === 'completed' ? 'completed' : 'in_progress') as 'completed' | 'in_progress',
                time: formatDateRelative(event.updated_at),
                type: event.status === 'completed' ? 'Graded' : 'Evaluating'
            }
        })
    } catch (err) {
        return []
    }
}

function formatDateRelative(dateString: string) {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    return date.toLocaleDateString()
}

export async function getLeaderboard() {
    try {
        const supabase = await createClient()

        const { data, error } = await supabase
            .from('teams')
            .select(`
                id,
                team_name,
                domain,
                stall_no,
                total_score
            `)
            .order('total_score', { ascending: false })

        if (error || !data) {
            return []
        }

        return (data || []).map((team, index) => ({
            id: team.id,
            name: team.team_name,
            score: team.total_score,
            domain: team.domain,
            stall: team.stall_no,
            rank: index + 1
        }))
    } catch (err) {
        return []
    }
}
