import { getCurrentUser, signOut } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { RealtimeProvider } from '@/components/realtime-provider'
import { redirect } from 'next/navigation'
import PWAInitializer from '@/components/pwa-initializer'
import { NavLink } from '@/components/nav-link'
import { Toaster } from '@/components/ui/toaster'
import { OrientationLock } from '@/components/orientation-lock'
import {
  LayoutDashboard,
  Calendar,
  Users,
  Gavel,
  Trophy,
  LogOut,
  User,
  Settings2,
  MoreHorizontal
} from 'lucide-react'
import { MobileMoreMenu } from '@/components/mobile-more-menu'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, iconName: 'LayoutDashboard', roles: ['admin', 'mentor', 'student'] },
    { href: '/dashboard/events', label: 'Events', icon: Calendar, iconName: 'Calendar', roles: ['admin', 'mentor'] },
    { href: '/dashboard/students', label: 'Students', icon: Users, iconName: 'Users', roles: ['admin'] },
    { href: '/dashboard/mentors', label: 'Mentors', icon: User, iconName: 'User', roles: ['admin'] },
    { href: '/dashboard/teams', label: 'Teams', icon: Users, iconName: 'Users', roles: ['admin', 'mentor', 'student'] },
    { href: '/dashboard/my-teams', label: 'My Teams', icon: Users, iconName: 'Users', roles: ['student'] },
    { href: '/dashboard/criteria', label: 'Criteria', icon: Settings2, iconName: 'Settings2', roles: ['admin'] },
    { href: '/dashboard/judging', label: 'Judging', icon: Gavel, iconName: 'Gavel', roles: ['mentor'] },
    { href: '/dashboard/leaderboard', label: 'Leaderboard', icon: Trophy, iconName: 'Trophy', roles: ['admin', 'mentor', 'student'] },
    { href: '/dashboard/profile', label: 'Profile', icon: User, iconName: 'User', roles: ['mentor'] },
  ]

  const filteredNav = navItems.filter(item => item.roles.includes(user.role))

  return (
    <>
      <PWAInitializer />
      <OrientationLock />
      <RealtimeProvider>
        <div className="min-h-screen bg-background flex flex-col md:flex-row">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-72 border-r flex-col bg-sidebar sticky top-0 h-screen shadow-sm">
          <div className="p-6 border-b flex flex-col gap-3">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">LJ University</h1>
            <span className="text-xs px-3 py-1.5 bg-primary text-primary-foreground rounded-full capitalize font-semibold w-fit">
              {user.role}
            </span>
          </div>
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {filteredNav.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg hover:bg-sidebar-accent transition-all group relative overflow-hidden [&.bg-primary]:hover:bg-primary [&.bg-primary]:hover:text-primary-foreground"
              >
                <item.icon className="h-5 w-5 text-muted-foreground group-hover:text-sidebar-primary transition-colors z-10 [.bg-primary_&]:text-primary-foreground [.bg-primary_&]:group-hover:text-primary-foreground" />
                <span className="z-10">{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="p-4 border-t mt-auto space-y-3">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-sidebar-accent/50">
              <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col overflow-hidden flex-1">
                <span className="text-sm font-semibold truncate">{user.fullName || user.email}</span>
                <span className="text-xs text-muted-foreground truncate">{user.email}</span>
              </div>
            </div>
            <form action={signOut}>
              <Button variant="outline" className="w-full justify-start gap-3 hover:bg-destructive/10 hover:text-destructive hover:border-destructive transition-all" type="submit">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </form>
          </div>
        </aside>

        {/* Mobile Header */}
        <header className="md:hidden border-b bg-card h-16 flex items-center justify-between px-4 sticky top-0 z-50">
          <h1 className="text-lg font-bold text-primary">LJ Events</h1>
          <form action={signOut}>
            <Button variant="ghost" size="icon" type="submit">
              <LogOut className="h-5 w-5" />
            </Button>
          </form>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 pb-20 md:pb-0 min-h-screen overflow-auto">
          <div className="max-w-full mx-auto p-4 md:p-8">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-card/95 backdrop-blur-lg h-16 flex items-center justify-around px-3 z-50 shadow-lg">
          {filteredNav.slice(0, 3).map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 py-1.5 px-2 rounded-lg transition-all"
            >
              <item.icon className="h-5 w-5 text-muted-foreground" />
              <span className="text-[10px] font-semibold text-muted-foreground">
                {item.label}
              </span>
            </NavLink>
          ))}
          {filteredNav.length > 3 && (
            <MobileMoreMenu items={filteredNav.slice(3).map(item => ({
              href: item.href,
              label: item.label,
              iconName: item.iconName,
              roles: item.roles
            }))} />
          )}
        </nav>
        </div>
      </RealtimeProvider>
      <Toaster />
    </>
  )
}
