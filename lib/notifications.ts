export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.error('[v0] Service Worker registration failed:', error)
    })
  }
}

export function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
}

export function sendNotification(title: string, options?: NotificationOptions) {
  if ('Notification' in window && Notification.permission === 'granted') {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'SHOW_NOTIFICATION',
        title,
        options,
      })
    } else {
      new Notification(title, options)
    }
  }
}

export function notifyScoresUpdated(teamName: string) {
  sendNotification(`Scores Updated: ${teamName}`, {
    badge: '/icon.svg',
    tag: 'scores-update',
    requireInteraction: false,
  })
}

export function notifyLeaderboardUpdated() {
  sendNotification('Leaderboard Updated', {
    badge: '/icon.svg',
    tag: 'leaderboard-update',
    requireInteraction: false,
  })
}

export function notifyEventActive(eventName: string) {
  sendNotification(`Event Started: ${eventName}`, {
    badge: '/icon.svg',
    tag: 'event-active',
    requireInteraction: false,
  })
}
