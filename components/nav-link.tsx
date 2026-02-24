'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

interface NavLinkProps {
  href: string
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function NavLink({ href, children, className = '', onClick, ...props }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href
  
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`${className} ${isActive ? 'bg-black dark:bg-white text-white dark:text-black [&>svg]:text-white dark:[&>svg]:text-black [&>span]:text-white dark:[&>span]:text-black shadow-md hover:bg-black hover:dark:bg-white hover:[&>svg]:text-white hover:dark:[&>svg]:text-black hover:[&>span]:text-white hover:dark:[&>span]:text-black' : ''}`}
      {...props}
    >
      {children}
    </Link>
  )
}
