import { getCurrentUser, signOut } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { RealtimeProvider } from '@/components/realtime-provider'
import { ThemeProvider } from '@/components/theme-provider'
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
  MoreHorizontal,
  UserCog
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
    { href: '/dashboard/assign-judges', label: 'Assign Judges', icon: UserCog, iconName: 'UserCog', roles: ['admin'] },
    { href: '/dashboard/criteria', label: 'Criteria', icon: Settings2, iconName: 'Settings2', roles: ['admin'] },
    { href: '/dashboard/judging', label: 'Judging', icon: Gavel, iconName: 'Gavel', roles: ['mentor'] },
    { href: '/dashboard/leaderboard', label: 'Leaderboard', icon: Trophy, iconName: 'Trophy', roles: ['admin', 'mentor', 'student'] },
    { href: '/dashboard/profile', label: 'Profile', icon: User, iconName: 'User', roles: ['admin', 'student', 'mentor'] },
  ]

  const filteredNav = navItems.filter(item => item.roles.includes(user.role))

  return (
    <>
      <PWAInitializer />
      <OrientationLock />
      <ThemeProvider theme={user.theme} />
      <RealtimeProvider>
        <div className="min-h-screen bg-white dark:bg-black flex flex-col md:flex-row">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-72 border-r border-gray-200 dark:border-neutral-800 flex-col bg-white dark:bg-neutral-900 sticky top-0 h-screen shadow-sm">
          <div className="p-6 border-b border-gray-200 dark:border-neutral-800 flex flex-col gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">LJ University</h1>
            <span className="text-xs px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full capitalize font-semibold w-fit">
              {user.role}
            </span>
          </div>
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {filteredNav.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 transition-all"
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="p-4 border-t border-gray-200 dark:border-neutral-800 mt-auto space-y-3">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-gray-100 dark:bg-neutral-800">
              <div className="h-10 w-10 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-white dark:text-gray-900" />
              </div>
              <div className="flex flex-col overflow-hidden flex-1">
                <span className="text-sm font-semibold truncate text-gray-900 dark:text-white">{user.fullName || user.email}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</span>
              </div>
            </div>
            <form action={signOut}>
              <Button variant="outline" className="w-full justify-start gap-3 border-gray-300 dark:border-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-300" type="submit">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </form>
          </div>
        </aside>

        {/* Mobile Header */}
        <header className="md:hidden border-b border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 h-16 flex items-center justify-between px-4 sticky top-0 z-50">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">LJ Events</h1>
          <form action={signOut}>
            <Button variant="ghost" size="icon" type="submit" className="text-gray-700 dark:text-gray-300">
              <LogOut className="h-5 w-5" />
            </Button>
          </form>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 pb-20 md:pb-0 min-h-screen overflow-auto bg-white dark:bg-black">
          <div className="max-w-full mx-auto p-4 md:p-8">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Nav */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-gray-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-lg h-16 flex items-center justify-around px-3 z-50 shadow-lg">
          {filteredNav.slice(0, 3).map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 py-1.5 px-2 rounded-lg transition-all"
            >
              <item.icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-400">
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
