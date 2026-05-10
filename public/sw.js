/**
 * Lunerie service worker.
 *
 * Cache strategy summary:
 *   - app shell  → cache-first, precached on install
 *   - JS / CSS   → stale-while-revalidate (Vite hashes files, so cache-key safe)
 *   - images     → cache-first with size cap (60 entries / 24 h)
 *   - external API hosts → stale-while-revalidate with network-first fallback
 *   - HTML navigations → network-first with offline shell fallback
 *
 * Bump CACHE_VERSION when the runtime needs to invalidate everything.
 */

const CACHE_VERSION = 'v3';
const STATIC_CACHE = `lunerie-static-${CACHE_VERSION}`;
const ASSET_CACHE = `lunerie-assets-${CACHE_VERSION}`;
const IMAGE_CACHE = `lunerie-images-${CACHE_VERSION}`;
const RUNTIME_CACHE = `lunerie-runtime-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icon-maskable.svg',
  '/icon-monochrome.svg',
  '/apple-touch-icon.svg',
  '/offline.html',
];

const API_HOSTS = new Set([
  'nominatim.openstreetmap.org',
  'overpass-api.de',
  'secure.geonames.org',
  'restcountries.com',
  'api.pexels.com',
  'api.unsplash.com',
  'images.pexels.com',
  'images.unsplash.com',
  'tile.openstreetmap.org',
]);

const IMAGE_DESTINATIONS = new Set(['image']);
const SCRIPT_LIKE_DESTINATIONS = new Set(['script', 'style', 'worker', 'font']);

const IMAGE_LIMIT = 60;
const IMAGE_TTL_MS = 24 * 60 * 60 * 1000;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .catch(() => undefined),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  const allowed = new Set([STATIC_CACHE, ASSET_CACHE, IMAGE_CACHE, RUNTIME_CACHE]);
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => !allowed.has(key)).map((key) => caches.delete(key)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Same-origin HTML navigations: network-first, fall back to cached app-shell, then offline.html.
  if (request.mode === 'navigate') {
    event.respondWith(navigationStrategy(request));
    return;
  }

  // External API hosts: stale-while-revalidate so a flaky network never blocks the UI.
  if (API_HOSTS.has(url.hostname)) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
    return;
  }

  // Hashed Vite assets — safe to cache hard.
  if (url.origin === self.location.origin && SCRIPT_LIKE_DESTINATIONS.has(request.destination)) {
    event.respondWith(staleWhileRevalidate(request, ASSET_CACHE));
    return;
  }

  // Images: cache-first with eviction.
  if (IMAGE_DESTINATIONS.has(request.destination)) {
    event.respondWith(cacheFirstWithLimit(request, IMAGE_CACHE, IMAGE_LIMIT, IMAGE_TTL_MS));
    return;
  }

  // Default: cache-first against runtime cache.
  event.respondWith(cacheFirst(request, RUNTIME_CACHE));
});

async function navigationStrategy(request) {
  const cache = await caches.open(STATIC_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put('/', response.clone()).catch(() => undefined);
    return response;
  } catch {
    const cachedShell = await cache.match('/');
    if (cachedShell) return cachedShell;
    const offline = await cache.match('/offline.html');
    if (offline) return offline;
    return new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone()).catch(() => undefined);
    return response;
  } catch (error) {
    if (cached) return cached;
    throw error;
  }
}

async function cacheFirstWithLimit(request, cacheName, limit, ttlMs) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) {
    const cachedAt = Number(cached.headers.get('x-sw-cached-at'));
    if (!Number.isFinite(cachedAt) || Date.now() - cachedAt < ttlMs) return cached;
  }
  try {
    const response = await fetch(request);
    if (response.ok) {
      const stamped = new Response(response.clone().body, {
        status: response.status,
        statusText: response.statusText,
        headers: new Headers([
          ...Array.from(response.headers.entries()),
          ['x-sw-cached-at', Date.now().toString()],
        ]),
      });
      cache.put(request, stamped).catch(() => undefined);
      trimCache(cache, limit).catch(() => undefined);
    }
    return response;
  } catch (error) {
    if (cached) return cached;
    throw error;
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone()).catch(() => undefined);
      return response;
    })
    .catch(() => cached);
  return cached ?? networkPromise;
}

async function trimCache(cache, limit) {
  const keys = await cache.keys();
  if (keys.length <= limit) return;
  const overflow = keys.length - limit;
  for (let i = 0; i < overflow; i += 1) {
    await cache.delete(keys[i]);
  }
}
