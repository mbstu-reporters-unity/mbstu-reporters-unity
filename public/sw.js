const VERSION = 'mbsturu-v3'
const STATIC_CACHE = `${VERSION}-static`
const PAGE_CACHE = `${VERSION}-pages`
const DATA_CACHE = `${VERSION}-data`
const IMAGE_CACHE = `${VERSION}-images`

const SB_HOST = 'pdualebabnvkoaqaqcut.supabase.co'

const CACHEABLE_REST_PREFIXES = [
  '/rest/v1/posts',
  '/rest/v1/board_notices',
  '/rest/v1/campus_clubs',
  '/rest/v1/faculties',
  '/rest/v1/departments',
  '/rest/v1/department_teachers',
  '/rest/v1/department_events',
  '/rest/v1/mbstu_administration',
  '/rest/v1/community_pages',
  '/rest/v1/student_items',
  '/rest/v1/student_corner_categories',
  '/rest/v1/ticker_items',
  '/rest/v1/categories',
  '/rest/v1/app_config',
  '/rest/v1/site_settings',
  '/rest/v1/leaders',
  '/rest/v1/hero_slides',
  '/rest/v1/hero_settings',
  '/rest/v1/stories',
  '/rest/v1/reels',
  '/rest/v1/post_images',
  '/rest/v1/image_layouts',
  '/rest/v1/university_associations',
  '/rest/v1/mbstu_social_sites',
  '/rest/v1/social_site_notices',
]

const PRECACHE_PAGES = [
  '/',
  '/offline',
  '/notices',
  '/administration',
  '/associations',
  '/social-sites',
  '/student-corner',
  '/council',
]

const PRECACHE_IMAGES = ['/logo.png', '/icon.png']

async function notifyClients(online) {
  try {
    const clients = await self.clients.matchAll({ includeUncontrolled: true })
    clients.forEach((c) => c.postMessage({ type: online ? 'ONLINE_DETECTED' : 'OFFLINE_DETECTED' }))
  } catch {}
}

function normalizeDataKey(requestUrl) {
  const u = new URL(requestUrl)
  if (u.pathname === '/rest/v1/board_notices') {
    const params = new URLSearchParams(u.search)
    const orVal = params.get('or')
    if (orVal && orVal.includes('expires_at.gt.')) {
      params.set('or', '(expires_at.is.null,expires_at.gt.NOW)')
    }
    return `${u.origin}${u.pathname}?${params.toString()}`
  }
  return requestUrl
}

async function fetchAndCacheImage(rawUrl) {
  try {
    const u = new URL(rawUrl, self.location.origin)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return
    const imageCache = await caches.open(IMAGE_CACHE)
    if (await imageCache.match(u.href, { ignoreVary: true })) return

    let res = null
    try {
      res = await fetch(u.href)
    } catch {
      res = await fetch(u.href, { mode: 'no-cors' })
    }
    if (res && (res.ok || res.type === 'opaque')) {
      await imageCache.put(u.href, res)
    }
  } catch {}
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const pageCache = await caches.open(PAGE_CACHE)
      const staticCache = await caches.open(STATIC_CACHE)

      await Promise.allSettled([
        ...PRECACHE_PAGES.map(async (u) => {
          try {
            const res = await fetch(u, { credentials: 'same-origin' })
            if (res && res.ok) {
              const full = new URL(u, self.location.origin).href
              await pageCache.put(full, res.clone())
              if (u === '/offline') await staticCache.put(full, res.clone())
            }
          } catch {}
        }),
        ...PRECACHE_IMAGES.map((img) => fetchAndCacheImage(img)),
      ])

      await self.skipWaiting()
    })()
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'CACHE_URLS' && Array.isArray(event.data.urls)) {
    event.waitUntil(
      (async () => {
        const staticCache = await caches.open(STATIC_CACHE)
        await Promise.allSettled(
          event.data.urls.map(async (rawUrl) => {
            try {
              const u = new URL(rawUrl, self.location.origin)
              if (u.protocol !== 'http:' && u.protocol !== 'https:') return
              const isStatic = u.origin === self.location.origin && u.pathname.startsWith('/_next/static/')
              if (isStatic) {
                if (await staticCache.match(u.href)) return
                const res = await fetch(u.href)
                if (res && res.ok) await staticCache.put(u.href, res)
              } else {
                await fetchAndCacheImage(u.href)
              }
            } catch {}
          })
        )
      })()
    )
  }
})

async function offlineFallbackResponse() {
  const staticCache = await caches.open(STATIC_CACHE)
  const pageCache = await caches.open(PAGE_CACHE)
  const offlineUrl = new URL('/offline', self.location.origin).href
  const cachedOffline = (await pageCache.match(offlineUrl)) || (await staticCache.match(offlineUrl))
  if (cachedOffline) return cachedOffline

  return new Response(
    '<!doctype html><html lang="bn"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>অফলাইন | MBSTURU</title></head><body style="background:#071030;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:20px"><div><h2>আপনি এখন অফলাইনে আছেন</h2><p>ইন্টারনেট সংযোগ চালু করে পুনরায় চেষ্টা করুন।</p><button onclick="location.reload()" style="padding:10px 20px;border-radius:999px;border:none;background:#0284c7;color:#fff;font-weight:bold">আবার চেষ্টা করুন</button></div></body></html>',
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  )
}

async function handlePageRequest(request) {
  const url = new URL(request.url)
  const cleanUrl = `${url.origin}${url.pathname}`
  const cache = await caches.open(PAGE_CACHE)

  try {
    const response = await fetch(request)
    if (response && response.ok && response.type !== 'opaqueredirect') {
      notifyClients(true)
      await cache.put(request.url, response.clone()).catch(() => {})
      if (cleanUrl !== request.url) {
        await cache.put(cleanUrl, response.clone()).catch(() => {})
      }
    }
    return response
  } catch {
    notifyClients(false)
    const exact = await caches.match(request.url, { ignoreVary: true })
    if (exact) return exact
    const byPath = await caches.match(cleanUrl, { ignoreVary: true })
    if (byPath) return byPath
    return offlineFallbackResponse()
  }
}

async function handleRscRequest(request) {
  const url = new URL(request.url)
  const rscKey = `${url.origin}${url.pathname}?__rsc=1`
  const cache = await caches.open(PAGE_CACHE)

  try {
    const response = await fetch(request)
    if (response && response.ok) {
      await cache.put(rscKey, response.clone()).catch(() => {})
    }
    return response
  } catch {
    const cached = await cache.match(rscKey, { ignoreVary: true })
    if (cached) return cached
    return Response.error()
  }
}

async function handleDataRequest(request) {
  const cache = await caches.open(DATA_CACHE)
  const key = normalizeDataKey(request.url)

  try {
    const response = await fetch(request)
    if (response && response.ok) {
      notifyClients(true)
      await cache.put(key, response.clone()).catch(() => {})
    }
    return response
  } catch {
    notifyClients(false)
    const cached = (await cache.match(key, { ignoreVary: true })) || (await cache.match(request.url, { ignoreVary: true }))
    if (cached) return cached
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached =
    (await cache.match(request.url, { ignoreVary: true })) ||
    (await caches.match(request.url, { ignoreVary: true }))
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response && (response.ok || response.type === 'opaque')) {
      await cache.put(request.url, response.clone()).catch(() => {})
    }
    return response
  } catch {
    return new Response('', { status: 504 })
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return

  // ১. Supabase পাবলিক ডাটা ও ছবি
  if (url.hostname === SB_HOST) {
    if (url.pathname.startsWith('/storage/v1/object/public/')) {
      event.respondWith(cacheFirst(request, IMAGE_CACHE))
      return
    }
    if (CACHEABLE_REST_PREFIXES.some((p) => url.pathname.startsWith(p))) {
      event.respondWith(handleDataRequest(request))
      return
    }
    return
  }

  // ২. বাইরের যেকোনো ছবি (যেমন mbstu.ac.bd লোগো, YouTube থাম্বনেইল)
  if (url.origin !== self.location.origin) {
    if (request.destination === 'image') {
      event.respondWith(cacheFirst(request, IMAGE_CACHE))
    }
    return
  }

  // ৩. প্রাইভেট পেজ অফলাইনে গেলে সুন্দর অফলাইন পেজ দেখাবে
  if (
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/messages') ||
    url.pathname.startsWith('/friends') ||
    url.pathname.startsWith('/reset')
  ) {
    if (request.mode === 'navigate') {
      event.respondWith(
        fetch(request).catch(() => {
          notifyClients(false)
          return offlineFallbackResponse()
        })
      )
    }
    return
  }

  // ৪. স্ট্যাটিক JS/CSS ও ছবি
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }

  if (request.destination === 'image' || /\.(png|jpg|jpeg|webp|svg|ico|gif)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE))
    return
  }

  // ৫. Next.js RSC রিকোয়েস্ট
  if (request.headers.get('RSC') === '1' || url.searchParams.has('_rsc')) {
    event.respondWith(handleRscRequest(request))
    return
  }

  // ৬. পেজ নেভিগেশন ও প্রিফেচ
  if (
    request.mode === 'navigate' ||
    request.headers.get('X-Offline-Prefetch') === '1' ||
    (request.headers.get('Accept') || '').includes('text/html')
  ) {
    event.respondWith(handlePageRequest(request))
  }
})
