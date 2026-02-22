'use client'

import { useEffect, useState } from 'react'

export function OrientationLock() {
  const [isLandscape, setIsLandscape] = useState(false)

  useEffect(() => {
    const checkOrientation = () => {
      const isLandscapeMode = window.innerWidth < 768 && window.innerWidth > window.innerHeight
      setIsLandscape(isLandscapeMode)
    }

    checkOrientation()
    window.addEventListener('resize', checkOrientation)
    window.addEventListener('orientationchange', checkOrientation)

    // Try to lock orientation
    const lockOrientation = async () => {
      try {
        if (window.screen?.orientation?.lock) {
          await window.screen.orientation.lock('portrait-primary')
        }
      } catch (error) {
        // Fallback to overlay blocking
      }
    }

    if (window.innerWidth < 768) {
      lockOrientation()
    }

    return () => {
      window.removeEventListener('resize', checkOrientation)
      window.removeEventListener('orientationchange', checkOrientation)
    }
  }, [])

  if (!isLandscape) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#000',
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        padding: '20px',
      }}
    >
      <div style={{ fontSize: '48px', marginBottom: '20px' }}>📱</div>
      <div
        style={{
          color: '#fff',
          fontSize: '20px',
          fontWeight: 'bold',
          textAlign: 'center',
          lineHeight: '1.5',
        }}
      >
        Please rotate your device to portrait mode
      </div>
    </div>
  )
}
