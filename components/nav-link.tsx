'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

interface NavLinkProps {
  href: string
  children: React.ReactNode
  className?: string
}

export function NavLink({ href, children, className = '', ...props }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href
  
  return (
    <Link
      href={href}
      className={`${className} ${isActive ? 'bg-gray-900 text-white [&>svg]:text-white' : ''}`}
      {...props}
    >
      {children}
    </Link>
  )
}