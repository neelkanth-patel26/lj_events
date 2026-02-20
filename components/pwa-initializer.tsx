'use client'

import { useEffect } from 'react'
import { registerServiceWorker, requestNotificationPermission } from '@/lib/notifications'

export default function PWAInitializer() {
  useEffect(() => {
    // Register service worker for offline support
    registerServiceWorker()

    // Request notification permissions
    requestNotificationPermission()

    // Check for app updates
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CHECK_UPDATES' })
    }
  }, [])

  return null
}
