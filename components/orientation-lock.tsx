'use client'

import { useEffect } from 'react'

export function OrientationLock() {
  useEffect(() => {
    // Lock to portrait orientation on mobile devices
    const lockOrientation = async () => {
      try {
        if (screen.orientation && screen.orientation.lock) {
          await screen.orientation.lock('portrait')
        }
      } catch (error) {
        // Silently fail if orientation lock is not supported
        console.log('Orientation lock not supported')
      }
    }

    // Only lock on mobile devices
    if (window.innerWidth < 768) {
      lockOrientation()
    }

    // Add CSS to hide content in landscape mode
    const style = document.createElement('style')
    style.innerHTML = `
      @media screen and (max-width: 768px) and (orientation: landscape) {
        body::before {
          content: '';
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: white;
          z-index: 99999;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        body::after {
          content: '📱 Please rotate your device to portrait mode';
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 100000;
          font-size: 18px;
          text-align: center;
          padding: 20px;
          color: #000;
        }
      }
    `
    document.head.appendChild(style)

    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return null
}
