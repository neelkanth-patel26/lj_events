'use client'

import { Minus, Square, X, Maximize2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import Image from 'next/image'

export function CustomTitleBar() {
  const [isDesktop, setIsDesktop] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)

  useEffect(() => {
    const checkDisplayMode = () => {
      const isWCO = window.matchMedia('(display-mode: window-controls-overlay)').matches
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isMinWidth = window.innerWidth >= 768
      setIsDesktop((isWCO || isStandalone) && isMinWidth)
    }
    
    checkDisplayMode()
    window.addEventListener('resize', checkDisplayMode)
    return () => window.removeEventListener('resize', checkDisplayMode)
  }, [])

  const handleMinimize = () => {
    if ('windowControlsOverlay' in navigator) {
      window.resizeTo(window.screen.availWidth, 100)
    }
  }

  const handleMaximize = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
      setIsMaximized(false)
    } else {
      document.documentElement.requestFullscreen()
      setIsMaximized(true)
    }
  }

  const handleClose = () => {
    window.close()
  }

  if (!isDesktop) return null

  return (
    <div 
      className="fixed top-0 left-0 right-0 h-12 bg-background/95 backdrop-blur-sm border-b flex items-center justify-between px-4 z-50 select-none shadow-sm"
      style={{ WebkitAppRegion: 'drag' } as any}
    >
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 relative">
          <Image src="/icon-light.svg" alt="LJ Events" width={24} height={24} className="dark:hidden" />
          <Image src="/icon-dark.svg" alt="LJ Events" width={24} height={24} className="hidden dark:block" />
        </div>
        <span className="text-sm font-semibold tracking-tight">LJ Events</span>
      </div>
      
      <div className="flex items-center" style={{ WebkitAppRegion: 'no-drag' } as any}>
        <button 
          onClick={handleMinimize}
          className="h-10 w-10 hover:bg-accent/50 transition-colors flex items-center justify-center group"
          title="Minimize"
        >
          <Minus className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
        </button>
        <button 
          onClick={handleMaximize}
          className="h-10 w-10 hover:bg-accent/50 transition-colors flex items-center justify-center group"
          title={isMaximized ? "Restore" : "Maximize"}
        >
          {isMaximized ? (
            <Square className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
          ) : (
            <Maximize2 className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
          )}
        </button>
        <button 
          onClick={handleClose}
          className="h-10 w-10 hover:bg-red-500 hover:text-white transition-colors flex items-center justify-center group"
          title="Close"
        >
          <X className="h-4 w-4 text-muted-foreground group-hover:text-white" />
        </button>
      </div>
    </div>
  )
}
