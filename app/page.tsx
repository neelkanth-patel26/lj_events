'use client'

import { getCurrentUser } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Home() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Force light mode on landing page
    document.documentElement.classList.remove('dark')
    localStorage.removeItem('theme')
    
    getCurrentUser().then((u) => {
      setUser(u)
      setLoading(false)
      if (u) router.push('/dashboard')
    })
  }, [])

  if (loading) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 relative overflow-hidden">
      <div className="relative flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <div className="max-w-4xl space-y-10">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary shadow-lg shadow-primary/20 mb-6">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div className="space-y-6">
            <h1 className="text-4xl md:text-7xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-primary to-gray-900 bg-clip-text text-transparent">
              LJ University Event Management
            </h1>
            <p className="text-lg md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Manage events, evaluate teams, and track leaderboards with our comprehensive
              event management platform.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link href="/auth/login">
              <Button size="lg" className="w-full sm:w-auto min-w-[160px] h-14 text-lg shadow-lg hover:shadow-xl transition-all">
                Sign In
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button size="lg" variant="outline" className="w-full sm:w-auto min-w-[160px] h-14 text-lg border-2 hover:bg-primary hover:text-white transition-all">
                Sign Up
              </Button>
            </Link>
          </div>
          <div className="pt-10 space-y-6 hidden md:block">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Features for Admins, Mentors/Judges, and Students
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="px-6 py-3 bg-white shadow-md hover:shadow-lg rounded-full text-sm font-semibold transition-all hover:scale-105 cursor-default">
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Event Management</span>
              </div>
              <div className="px-6 py-3 bg-white shadow-md hover:shadow-lg rounded-full text-sm font-semibold transition-all hover:scale-105 cursor-default">
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Team Evaluation</span>
              </div>
              <div className="px-6 py-3 bg-white shadow-md hover:shadow-lg rounded-full text-sm font-semibold transition-all hover:scale-105 cursor-default">
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Live Leaderboards</span>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-0 right-0 text-center space-y-1">
          <p className="text-sm font-semibold text-gray-900">Made By Group 1</p>
          <p className="text-xs text-muted-foreground">Copyright © Gaming Network Studio Media Group</p>
        </div>
      </div>
    </div>
  )
}
