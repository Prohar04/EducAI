const CACHE = "educai-v1"
const PRECACHE_ASSETS = [
  "/",
  "/auth/signin",
  "/auth/signup",
]

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE_ASSETS))
  )
  self.skipWaiting()
})

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url)

  // Only cache same-origin GETs
  if (url.origin !== self.location.origin) return
  if (e.request.method !== "GET") return
  // Skip API and Next.js internal routes
  if (url.pathname.startsWith("/api/")) return
  if (url.pathname.startsWith("/_next/")) return

  e.respondWith(
    caches.match(e.request).then((cached) =>
      cached ||
      fetch(e.request).then((res) => {
        // Only cache successful responses for static pages
        if (res.ok && res.status === 200) {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put(e.request, copy))
        }
        return res
      }).catch(() => cached)
    )
  )
})
