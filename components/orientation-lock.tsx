'use client'

import { useEffect } from 'react'

export function OrientationLock() {
  useEffect(() => {
    // Add CSS to completely block landscape mode on mobile
    const style = document.createElement('style')
    style.id = 'orientation-lock-style'
    style.innerHTML = `
      @media screen and (max-width: 768px) and (orientation: landscape) {
        html, body {
          overflow: hidden !important;
          position: fixed !important;
          width: 100% !important;
          height: 100% !important;
        }
        body > * {
          display: none !important;
        }
        body::before {
          content: '' !important;
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          bottom: 0 !important;
          background: #000 !important;
          z-index: 999999 !important;
          display: block !important;
        }
        body::after {
          content: '📱 Please rotate to portrait mode' !important;
          position: fixed !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
          z-index: 9999999 !important;
          font-size: 20px !important;
          font-weight: bold !important;
          text-align: center !important;
          padding: 30px !important;
          color: #fff !important;
          display: block !important;
          width: 80% !important;
          line-height: 1.5 !important;
        }
      }
    `
    document.head.appendChild(style)

    // Try to lock orientation using Screen Orientation API
    const lockOrientation = async () => {
      try {
        if (window.screen?.orientation?.lock) {
          await window.screen.orientation.lock('portrait')
        } else if ((window.screen as any).lockOrientation) {
          (window.screen as any).lockOrientation('portrait')
        } else if ((window.screen as any).mozLockOrientation) {
          (window.screen as any).mozLockOrientation('portrait')
        } else if ((window.screen as any).msLockOrientation) {
          (window.screen as any).msLockOrientation('portrait')
        }
      } catch (error) {
        // Orientation lock failed, CSS fallback will handle it
      }
    }

    if (window.innerWidth < 768) {
      lockOrientation()
    }

    return () => {
      const styleEl = document.getElementById('orientation-lock-style')
      if (styleEl) {
        document.head.removeChild(styleEl)
      }
    }
  }, [])

  return null
}
