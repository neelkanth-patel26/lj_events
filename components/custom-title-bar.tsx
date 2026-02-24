'use client'

import { Minus, Square, X, Maximize2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import Image from 'next/image'

export function CustomTitleBar() {
  const [isVisible, setIsVisible] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const [isMac, setIsMac] = useState(false)

  useEffect(() => {
    const checkPlatform = () => {
      const ua = navigator.userAgent.toLowerCase()
      setIsMac(ua.includes('mac'))
    }

    const checkDisplay = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isWCO = window.matchMedia('(display-mode: window-controls-overlay)').matches
      const isDesktop = window.innerWidth >= 768
      setIsVisible((isStandalone || isWCO) && isDesktop)
    }

    checkPlatform()
    checkDisplay()
    
    window.addEventListener('resize', checkDisplay)
    document.addEventListener('fullscreenchange', () => {
      setIsMaximized(!!document.fullscreenElement)
    })

    return () => {
      window.removeEventListener('resize', checkDisplay)
    }
  }, [])

  const handleMinimize = () => {
    // PWA limitation: Can't truly minimize, but can make smaller
    if (window.outerHeight > 200) {
      window.resizeTo(window.outerWidth, 200)
    }
  }

  const handleMaximize = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      document.documentElement.requestFullscreen().catch(() => {
        // Fallback: maximize window size
        window.resizeTo(screen.availWidth, screen.availHeight)
      })
    }
  }

  const handleClose = () => {
    if (confirm('Close LJ Events?')) {
      window.close()
    }
  }

  if (!isVisible) return null

  return (
    <div 
      className={`fixed top-0 left-0 right-0 h-11 bg-background/80 backdrop-blur-md border-b flex items-center justify-between z-50 select-none ${
        isMac ? 'px-20' : 'px-4'
      }`}
      style={{ WebkitAppRegion: 'drag' } as any}
    >
      {/* Mac: Controls on left */}
      {isMac && (
        <div className="absolute left-3 flex items-center gap-2" style={{ WebkitAppRegion: 'no-drag' } as any}>
          <button 
            onClick={handleClose}
            className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
            title="Close"
          />
          <button 
            onClick={handleMinimize}
            className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors"
            title="Minimize"
          />
          <button 
            onClick={handleMaximize}
            className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors"
            title="Maximize"
          />
        </div>
      )}

      {/* Center: App title and icon */}
      <div className="flex items-center gap-2 mx-auto">
        <div className="w-5 h-5 relative">
          <Image src="/icon-light.svg" alt="" width={20} height={20} className="dark:hidden" />
          <Image src="/icon-dark.svg" alt="" width={20} height={20} className="hidden dark:block" />
        </div>
        <span className="text-sm font-medium">LJ Events</span>
      </div>

      {/* Windows: Controls on right */}
      {!isMac && (
        <div className="flex items-center" style={{ WebkitAppRegion: 'no-drag' } as any}>
          <button 
            onClick={handleMinimize}
            className="h-11 w-12 hover:bg-accent/50 transition-colors flex items-center justify-center group"
            title="Minimize"
          >
            <Minus className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
          </button>
          <button 
            onClick={handleMaximize}
            className="h-11 w-12 hover:bg-accent/50 transition-colors flex items-center justify-center group"
            title={isMaximized ? 'Restore' : 'Maximize'}
          >
            {isMaximized ? (
              <Square className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
            )}
          </button>
          <button 
            onClick={handleClose}
            className="h-11 w-12 hover:bg-red-500 transition-colors flex items-center justify-center group"
            title="Close"
          >
            <X className="h-4 w-4 text-muted-foreground group-hover:text-white" />
          </button>
        </div>
      )}
    </div>
  )
}
