const VERSION = 'mbsturu-v1'
const STATIC_CACHE = `${VERSION}-static`
const PAGE_CACHE = `${VERSION}-pages`
const DATA_CACHE = `${VERSION}-data`
const IMAGE_CACHE = `${VERSION}-images`

const SB_HOST = 'pdualebabnvkoaqaqcut.supabase.co'

// যেসব পাবলিক API অফলাইনেও পড়া যাবে (প্রাইভেট চ্যাট/অথ/এডমিন নয়)
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

const PRECACHE_URLS = ['/', '/offline', '/notices', '/administration', '/logo.png']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS).catch(() => {}))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => !k.startsWith(VERSION))
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  )
})

async function networkFirst(request, cacheName, fallbackUrl = null) {
  const cache = await caches.open(cacheName)
  try {
    const response = await fetch(request)
    if (response && response.ok) {
      cache.put(request, response.clone()).catch(() => {})
    }
    return response
  } catch {
    const cached = await cache.match(request)
    if (cached) return cached
    if (fallbackUrl) {
      const staticCache = await caches.open(STATIC_CACHE)
      const offlinePage = await staticCache.match(fallbackUrl)
      if (offlinePage) return offlinePage
    }
    return new Response(JSON.stringify({ offline: true }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName)
  const cached = await cache.match(request)
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response && response.ok) {
      cache.put(request, response.clone()).catch(() => {})
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

  // ১. সুপাবেজের পাবলিক ডাটা (Network-first + Offline cache)
  if (url.hostname === SB_HOST) {
    if (url.pathname.startsWith('/storage/v1/object/public/')) {
      event.respondWith(cacheFirst(request, IMAGE_CACHE))
      return
    }
    if (CACHEABLE_REST_PREFIXES.some((p) => url.pathname.startsWith(p))) {
      event.respondWith(networkFirst(request, DATA_CACHE))
      return
    }
    return // auth, messages, friendships, rpc ক্যাশ হবে না
  }

  if (url.origin !== self.location.origin) return

  // প্রাইভেট বা এডমিন রাউট ক্যাশ না করা
  if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/messages')) {
    return
  }

  // ২. স্ট্যাটিক JS/CSS (_next/static) ও ছবি
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, STATIC_CACHE))
    return
  }

  if (request.destination === 'image' || /\.(png|jpg|jpeg|webp|svg|ico)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE))
    return
  }

  // ৩. পেজ নেভিগেশন ও Next.js RSC রিকোয়েস্ট
  if (request.mode === 'navigate' || request.headers.get('RSC') === '1') {
    event.respondWith(
      networkFirst(request, PAGE_CACHE, request.mode === 'navigate' ? '/offline' : null)
    )
  }
})
