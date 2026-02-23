'use client'

import { useState } from 'react'
import { MoreHorizontal, LayoutDashboard, Calendar, Users, Gavel, Trophy, User, Settings2, Shield, UserCog } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { NavLink } from '@/components/nav-link'

interface NavItem {
  href: string
  label: string
  iconName: string
  roles: string[]
}

const iconMap: Record<string, any> = {
  LayoutDashboard,
  Calendar,
  Users,
  Gavel,
  Trophy,
  User,
  Settings2,
  Shield,
  UserCog
}

export function MobileMoreMenu({ items }: { items: NavItem[] }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex flex-col items-center justify-center gap-1 py-1.5 px-2 rounded-lg transition-all"
      >
        <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
        <span className="text-[10px] font-semibold text-muted-foreground">More</span>
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" className="h-auto max-h-[70vh] pb-24">
          <SheetHeader>
            <SheetTitle>More Options</SheetTitle>
          </SheetHeader>
          <div className="space-y-2 mt-4">
            {items.map((item) => {
              const Icon = iconMap[item.iconName]
              return (
                <NavLink
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all hover:bg-sidebar-accent text-foreground"
                >
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  {item.label}
                </NavLink>
              )
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
