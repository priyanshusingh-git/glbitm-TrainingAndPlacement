import { defaultCache } from '@serwist/next/worker'
// @ts-expect-error - missing type definition in serwist
import { installSerwist } from 'serwist'

declare const self: any;

installSerwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: /^\/(?:student|admin|recruiter|trainer)(?:\/|$)/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'portal-pages',
        networkTimeoutSeconds: 5,
        expiration: { maxAgeSeconds: 30 * 60 },
      },
    },
    {
      matcher: /^\/api\/(?:placements|students|training|dashboard|notifications)/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'api-data',
        expiration: { maxAgeSeconds: 30 * 60 },
      },
    },
    {
      matcher: /^\/api\/(?:auth|upload)/,
      handler: 'NetworkOnly',
    },
    {
      matcher: /\.(?:js|css|woff2|woff|ttf)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-assets',
        expiration: { maxAgeSeconds: 365 * 24 * 60 * 60 },
      },
    },
    {
      matcher: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images',
        expiration: { maxAgeSeconds: 30 * 24 * 60 * 60 },
      },
    },
    ...defaultCache,
  ],
  fallbacks: {
    entries: [{ url: '/offline', matcher: /\.(html|json)$/ }],
  },
})

self.addEventListener('push', (event: any) => {
  const data = event.data?.json()
  if (!data) return
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-96x96.png',
      data: { url: data.url },
    })
  )
})

self.addEventListener('notificationclick', (event: any) => {
  event.notification.close()
  event.waitUntil((self as any).clients.openWindow(event.notification.data?.url || '/student'))
})
