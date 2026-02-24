'use client'

import { useEffect } from 'react'

export function ThemeProvider({ theme }: { theme?: string }) {
  useEffect(() => {
    const savedTheme = theme || 'light'
    const isDark = savedTheme === 'dark'
    
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    // Update theme-color meta tag for PWA status bar
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDark ? '#000000' : '#ffffff')
    }
  }, [theme])

  return null
}
