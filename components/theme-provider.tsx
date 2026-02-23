'use client'

import { useEffect } from 'react'

export function ThemeProvider({ theme }: { theme?: string }) {
  useEffect(() => {
    const savedTheme = theme || 'light'
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  return null
}
