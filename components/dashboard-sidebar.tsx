'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/app/actions/auth'
import {
  LayoutDashboard,
  Calendar,
  Users,
  Gavel,
  Trophy,
  LogOut,
  User
} from 'lucide-react'

interface DashboardSidebarProps {
  user: any
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname()

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'mentor', 'student'] },
    { href: '/dashboard/events', label: 'Events', icon: Calendar, roles: ['admin'] },
    { href: '/dashboard/students', label: 'Students', icon: Users, roles: ['admin'] },
    { href: '/dashboard/teams', label: 'Teams', icon: Users, roles: ['admin', 'mentor', 'student'] },
    { href: '/dashboard/judging', label: 'Judging', icon: Gavel, roles: ['mentor'] },
    { href: '/dashboard/leaderboard', label: 'Leaderboard', icon: Trophy, roles: ['admin', 'mentor', 'student'] },
  ]

  const filteredNav = navItems.filter(item => item.roles.includes(user.role))

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col bg-white dark:bg-slate-900 sticky top-0 h-screen border-r border-slate-200 dark:border-slate-700">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <LayoutDashboard className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold">LJ University</h1>
              <p className="text-xs text-muted-foreground">Event Management</p>
            </div>
          </div>
          <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-center">
            <span className="text-sm font-medium capitalize">
              {user.role}
            </span>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {filteredNav.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                  isActive ? 'bg-gray-100 dark:bg-gray-800' : ''
                }`}
              >
                <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <item.icon className="h-4 w-4 text-gray-600" />
                </div>
                {item.label}
              </Link>
            )
          })}
        </nav>
        
        {/* User Profile */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  {user.fullName || user.email}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>
          </div>
          <form action={signOut}>
            <Button 
              variant="outline" 
              className="w-full justify-start gap-3" 
              type="submit"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </form>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden border-b bg-white dark:bg-slate-900 h-16 flex items-center justify-between px-4 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <LayoutDashboard className="h-4 w-4 text-gray-600" />
          </div>
          <h1 className="text-lg font-bold">
            LJ Events
          </h1>
        </div>
        <form action={signOut}>
          <Button variant="ghost" size="icon" type="submit">
            <LogOut className="h-5 w-5" />
          </Button>
        </form>
      </header>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-white dark:bg-slate-900 h-16 flex items-center justify-around px-2 z-50 safe-area-bottom">
        {filteredNav.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 gap-1 py-2 px-1 rounded-lg transition-colors group ${
                isActive ? 'bg-gray-100 dark:bg-gray-800' : ''
              }`}
            >
              <item.icon className="h-5 w-5 text-gray-600" />
              <span className="text-[10px] font-medium text-gray-600 uppercase tracking-wider truncate max-w-full">
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}