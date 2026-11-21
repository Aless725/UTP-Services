/* UTP+ Service · service worker
 * Permite abrir la app sin conexión: guarda la estructura de la app (HTML, JS, CSS, íconos y fuentes).
 * Los datos de Supabase NO se guardan aquí: de eso se encarga la app (últimos datos consultados).
 */
const VERSION = 'utp-v1'
const SHELL = ['/', '/index.html', '/manifest.webmanifest', '/icons/icon-192.png', '/icons/apple-touch-icon.png']
const FONT_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})

async function networkFirst(request, fallbackKey) {
  const cache = await caches.open(VERSION)
  try {
    const res = await fetch(request)
    if (res.ok) cache.put(fallbackKey, res.clone())
    return res
  } catch {
    return (await cache.match(fallbackKey)) || (await cache.match('/index.html')) || Response.error()
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(VERSION)
  const hit = await cache.match(request)
  if (hit) return hit
  const res = await fetch(request)
  if (res.ok) cache.put(request, res.clone())
  return res
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(VERSION)
  const hit = await cache.match(request)
  const fresh = fetch(request)
    .then((res) => {
      if (res.ok || res.type === 'opaque') cache.put(request, res.clone())
      return res
    })
    .catch(() => undefined)
  return hit || (await fresh) || Response.error()
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)

  if (url.origin === self.location.origin) {
    // Se abre la app: siempre lo último si hay red; sin red, la última copia.
    if (request.mode === 'navigate') return event.respondWith(networkFirst(request, '/index.html'))
    // Archivos con nombre único (/assets/...) o íconos: no cambian, se sirven del guardado.
    if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/icons/')) return event.respondWith(cacheFirst(request))
    if (url.pathname === '/manifest.webmanifest') return event.respondWith(staleWhileRevalidate(request))
    return
  }

  if (FONT_HOSTS.includes(url.hostname)) event.respondWith(staleWhileRevalidate(request))
  // Supabase, Gemini y demás servicios pasan directo a la red.
})
