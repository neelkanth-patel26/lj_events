'use client'

import { useEffect, useState } from 'react'

export default function Preloader() {
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const theme = localStorage.getItem('theme')
    setIsDark(theme === 'dark')
    
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 2
      })
    }, 100)

    const timer = setTimeout(() => setIsLoading(false), 5500)
    return () => {
      clearTimeout(timer)
      clearInterval(progressInterval)
    }
  }, [])

  return (
    <div className={`fixed inset-0 z-[9999] ${isDark ? 'bg-black' : 'bg-white'} flex items-center justify-center transition-all duration-1000 ${isLoading ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
      <div className="text-center space-y-10 max-w-md px-4">
        <div className="relative w-40 h-40 mx-auto">
          <svg className="w-40 h-40 transform -rotate-90">
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className={isDark ? 'text-gray-800' : 'text-gray-200'}
            />
            <circle
              cx="80"
              cy="80"
              r="70"
              stroke="url(#gradient)"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 70}`}
              strokeDashoffset={`${2 * Math.PI * 70 * (1 - progress / 100)}`}
              className="transition-all duration-300"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#667eea" />
                <stop offset="100%" stopColor="#f093fb" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{progress}%</span>
          </div>
        </div>
        <div className="space-y-4">
          <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Made By Group-1 CE6C</h2>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Copyright © Gaming Network Studio Media Group</p>
          <div className={`w-full ${isDark ? 'bg-gray-800' : 'bg-gray-200'} rounded-full h-2 overflow-hidden`}>
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
