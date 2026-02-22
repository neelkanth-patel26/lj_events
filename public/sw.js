const CACHE_NAME = 'lj-events-v2'
const STATIC_CACHE = 'lj-events-static-v2'
const DYNAMIC_CACHE = 'lj-events-dynamic-v2'

const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json'
]

// Install - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...')
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .catch(err => console.log('[SW] Cache failed:', err))
  )
  self.skipWaiting()
})

// Activate - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...')
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map(key => {
            console.log('[SW] Removing old cache:', key)
            return caches.delete(key)
          })
      )
    })
  )
  self.clients.claim()
})

// Fetch - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return

  const { request } = event
  const url = new URL(request.url)

  // Skip chrome extensions and non-http requests
  if (!url.protocol.startsWith('http')) return

  // Skip API calls for offline page
  const isApiCall = url.pathname.startsWith('/api/')
  const isAuthCall = url.pathname.includes('/auth/')
  
  event.respondWith(
    fetch(request)
      .then(response => {
        // Clone response for caching
        const responseClone = response.clone()
        
        // Cache successful responses (except API calls)
        if (response.ok && response.type === 'basic' && !isApiCall) {
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(request, responseClone)
          })
        }
        
        return response
      })
      .catch(() => {
        // Fallback to cache
        return caches.match(request).then(cached => {
          if (cached) return cached
          
          // Return offline page for navigation requests
          if (request.mode === 'navigate' || request.destination === 'document') {
            return caches.match('/offline.html')
          }
          
          // Return offline response for API calls
          if (isApiCall) {
            return new Response(
              JSON.stringify({ error: 'No internet connection' }),
              { 
                status: 503,
                headers: { 'Content-Type': 'application/json' }
              }
            )
          }
          
          return new Response('Offline', { status: 503 })
        })
      })
  )
})

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {}
  const title = data.title || 'LJ Events'
  const options = {
    body: data.body || 'New notification',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: data.url || '/',
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'close', title: 'Close' }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data || '/')
    )
  }
})

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData())
  }
})

async function syncData() {
  console.log('[SW] Syncing data...')
  // Add your sync logic here
}

// Message handling
self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
