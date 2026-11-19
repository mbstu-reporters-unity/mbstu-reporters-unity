/* MBSTU Reporters' Unity (MBSTURU) - Offline PWA Service Worker */

const SW_VERSION = 'v3'
const PAGES_CACHE = `mbsturu-pages-${SW_VERSION}`
const STATIC_CACHE = `mbsturu-static-${SW_VERSION}`
const IMAGES_CACHE = `mbsturu-images-${SW_VERSION}`
const API_CACHE = `mbsturu-api-${SW_VERSION}`

const ACTIVE_CACHES = [PAGES_CACHE, STATIC_CACHE, IMAGES_CACHE, API_CACHE]
const OFFLINE_URL = '/offline'

const MAX_PAGES = 35
const MAX_IMAGES = 80
const MAX_API = 50

const PRIVATE_REST_PATHS = [
  'membership_applications',
  'user_submissions',
  'contact_feedback',
  'newsletter_subscribers',
  'newsroom_drafts',
  'event_registrations',
]

// ইন্সটলের সময় জরুরি অফলাইন শেল প্রি-ক্যাশ করা
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(PAGES_CACHE)
      .then((cache) =>
        Promise.allSettled([
          cache.add(OFFLINE_URL),
          caches.open(STATIC_CACHE).then((sc) => sc.add('/logo.png')),
        ])
      )
      .catch(() => {})
  )
  self.skipWaiting()
})

// পুরোনো ভার্সনের ক্যাশ পরিষ্কার করা
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => !ACTIVE_CACHES.includes(k))
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  )
})

// ক্যাশ লিমিট নিয়ন্ত্রণ (যাতে মোবাইলের জায়গা নষ্ট না হয়)
async function trimCache(cacheName, maxItems) {
  try {
    const cache = await caches.open(cacheName)
    const keys = await cache.keys()
    if (keys.length > maxItems) {
      const removeCount = keys.length - maxItems
      await Promise.all(keys.slice(0, removeCount).map((k) => cache.delete(k)))
    }
  } catch {}
}

// ক্লায়েন্টকে অনলাইন/অফলাইন স্ট্যাটাস জানানো
async function notifyClients(type) {
  try {
    const clients = await self.clients.matchAll({
      includeUncontrolled: true,
      type: 'window',
    })
    clients.forEach((client) => client.postMessage({ type }))
  } catch {}
}

// প্রাইভেট বা সেন্সিটিভ রিকোয়েস্ট কি না তা যাচাই
function isPrivateOrUncacheable(request, url) {
  if (request.method !== 'GET') return true

  // পিং ও ম্যানিফেস্ট সবসময় নেটওয়ার্ক থেকে আসবে
  if (url.pathname === '/manifest.webmanifest') return true

  // নিজের সার্ভারের অ্যাডমিন ও API রুট কখনো ক্যাশ হবে না
  if (url.origin === self.location.origin) {
    if (
      url.pathname.startsWith('/api/') ||
      url.pathname.startsWith('/admin') ||
      url.pathname.startsWith('/reset')
    ) {
      return true
    }
  }

  // লগইন করা ইউজারের JWT টোকেন (eyJ...) থাকলে কখনো ক্যাশ হবে না
  const authHeader = request.headers.get('Authorization') || ''
  if (/^Bearer\s+eyJ/i.test(authHeader)) return true

  // Supabase Auth, RPC ও প্রাইভেট টেবিল কখনো ক্যাশ হবে না
  if (url.hostname.includes('supabase.co')) {
    if (
      url.pathname.includes('/auth/v1/') ||
      url.pathname.includes('/rest/v1/rpc/')
    ) {
      return true
    }
    if (PRIVATE_REST_PATHS.some((tbl) => url.pathname.includes(tbl))) {
      return true
    }
  }

  return false
}

// OfflinePwaManager থেকে পাঠানো CACHE_URLS মেসেজ প্রসেস করা
self.addEventListener('message', (event) => {
  if (event.data?.type !== 'CACHE_URLS' || !Array.isArray(event.data.urls)) {
    return
  }

  const rawUrls = event.data.urls.filter(
    (u) =>
      typeof u === 'string' &&
      u.trim().length > 0 &&
      !u.includes('/admin') &&
      !u.includes('/api/') &&
      !u.includes('/reset')
  )

  event.waitUntil(
    (async () => {
      const staticCache = await caches.open(STATIC_CACHE)
      const imageCache = await caches.open(IMAGES_CACHE)

      await Promise.allSettled(
        rawUrls.map(async (rawUrl) => {
          try {
            const parsed = new URL(rawUrl, self.location.origin)
            if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return

            const isStaticAsset =
              parsed.origin === self.location.origin &&
              (parsed.pathname.startsWith('/_next/static/') ||
                parsed.pathname === '/logo.png' ||
                parsed.pathname === '/icon.png')

            const targetCache = isStaticAsset ? staticCache : imageCache
            const existing = await targetCache.match(parsed.href)
            if (existing) return

            let res
            try {
              res = await fetch(parsed.href, { mode: 'cors' })
            } catch {
              // থার্ড-পার্টি সাইটে (যেমন mbstu.ac.bd) CORS না থাকলে no-cors ফলব্যাক
              res = await fetch(parsed.href, { mode: 'no-cors' })
            }

            if (res && (res.ok || res.type === 'opaque')) {
              await targetCache.put(parsed.href, res)
            }
          } catch {}
        })
      )

      await trimCache(IMAGES_CACHE, MAX_IMAGES)
    })()
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (url.protocol !== 'http:' && url.protocol !== 'https:') return
  if (isPrivateOrUncacheable(request, url)) return

  const isPrefetch = request.headers.get('X-Offline-Prefetch') === '1'

  // ১. HTML পেজ নেভিগেশন ও ব্যাকগ্রাউন্ড প্রি-ফেচ (Network-First + Offline Fallback)
  if (request.mode === 'navigate' || isPrefetch) {
    event.respondWith(
      (async () => {
        try {
          const networkRes = await fetch(request)
          if (networkRes && networkRes.ok && url.origin === self.location.origin) {
            const cache = await caches.open(PAGES_CACHE)
            await cache.put(url.href, networkRes.clone())
            trimCache(PAGES_CACHE, MAX_PAGES)
          }
          if (request.mode === 'navigate') {
            notifyClients('ONLINE_DETECTED')
          }
          return networkRes
        } catch {
          if (request.mode === 'navigate') {
            notifyClients('OFFLINE_DETECTED')
          }
          const cache = await caches.open(PAGES_CACHE)
          const cachedPage =
            (await cache.match(url.href)) ||
            (await cache.match(url.pathname)) ||
            (request.mode === 'navigate' ? await cache.match(OFFLINE_URL) : null)

          return cachedPage || Response.error()
        }
      })()
    )
    return
  }

  // ২. Next.js স্ট্যাটিক JS/CSS ও লোগো (Cache-First)
  if (
    url.origin === self.location.origin &&
    (url.pathname.startsWith('/_next/static/') ||
      url.pathname === '/logo.png' ||
      url.pathname === '/icon.png' ||
      url.pathname.startsWith('/images/'))
  ) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(STATIC_CACHE)
        const cached = await cache.match(url.href)
        if (cached) return cached

        try {
          const networkRes = await fetch(request)
          if (networkRes && networkRes.ok) {
            await cache.put(url.href, networkRes.clone())
          }
          return networkRes
        } catch {
          return Response.error()
        }
      })()
    )
    return
  }

  // ৩. পাবলিক Supabase REST ডেটা (Network-First, নেট না থাকলে ক্যাশ থেকে দেখাবে)
  if (url.hostname.includes('supabase.co') && url.pathname.startsWith('/rest/v1/')) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(API_CACHE)
        try {
          const networkRes = await fetch(request)
          if (networkRes && networkRes.ok) {
            await cache.put(url.href, networkRes.clone())
            trimCache(API_CACHE, MAX_API)
          }
          return networkRes
        } catch {
          const cachedApi = await cache.match(url.href)
          return cachedApi || Response.error()
        }
      })()
    )
    return
  }

  // ৪. পাবলিক ছবি (Supabase Storage ও বাইরের ছবি — Cache-First + Network Fallback)
  if (
    request.destination === 'image' ||
    url.pathname.includes('/storage/v1/object/public/')
  ) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(IMAGES_CACHE)
        const cachedImg = await cache.match(url.href)
        if (cachedImg) return cachedImg

        try {
          const networkRes = await fetch(request)
          if (networkRes && (networkRes.ok || networkRes.type === 'opaque')) {
            await cache.put(url.href, networkRes.clone())
            trimCache(IMAGES_CACHE, MAX_IMAGES)
          }
          return networkRes
        } catch {
          return Response.error()
        }
      })()
    )
  }
})
