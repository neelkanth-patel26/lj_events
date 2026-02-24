'use client'

import { useEffect } from 'react'

export function ProfileNotificationService() {
  useEffect(() => {
    const checkAndNotify = async () => {
      try {
        // Check if notifications are supported
        if (!('Notification' in window)) return

        // Get user info
        const res = await fetch('/api/auth/me')
        const user = await res.json()
        
        if (user?.role !== 'mentor') return

        // Check profile completion
        const profileRes = await fetch('/api/mentors/profile')
        if (!profileRes.ok) {
          requestNotificationPermission()
          return
        }

        const profile = await profileRes.json()
        const isIncomplete = !profile.company || !profile.designation || !profile.bank_name || !profile.acc_no

        if (isIncomplete) {
          requestNotificationPermission()
        }
      } catch (error) {
        console.error('Notification check error:', error)
      }
    }

    const requestNotificationPermission = async () => {
      if (Notification.permission === 'granted') {
        showNotification()
      } else if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission()
        if (permission === 'granted') {
          showNotification()
        }
      }
    }

    const showNotification = () => {
      // Check if already shown today
      const lastShown = localStorage.getItem('profile_notification_shown')
      const today = new Date().toDateString()
      
      if (lastShown === today) return

      const notification = new Notification('Complete Your Profile', {
        body: 'Please update your professional and bank details to continue.',
        icon: '/icon-192x192.png',
        badge: '/icon-192x192.png',
        tag: 'profile-completion',
        requireInteraction: false,
        silent: false,
        vibrate: [200, 100, 200],
        data: {
          url: '/dashboard/profile'
        }
      })

      notification.onclick = (event) => {
        event.preventDefault()
        window.focus()
        window.location.href = '/dashboard/profile'
        notification.close()
      }

      localStorage.setItem('profile_notification_shown', today)
    }

    // Check on mount and every 30 minutes
    checkAndNotify()
    const interval = setInterval(checkAndNotify, 30 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  return null
}
