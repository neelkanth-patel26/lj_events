'use client'

import { useEffect, useState } from 'react'

export default function Loading() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const darkMode = document.documentElement.classList.contains('dark')
    setIsDark(darkMode)
  }, [])

  return (
    <div className={`flex items-center justify-center min-h-screen ${isDark ? 'bg-black' : 'bg-white'}`}>
      <div className="text-center">
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${isDark ? 'border-white' : 'border-gray-900'} mx-auto mb-4`}></div>
        <p className={`${isDark ? 'text-white' : 'text-gray-900'}`}>Loading...</p>
      </div>
    </div>
  )
}
