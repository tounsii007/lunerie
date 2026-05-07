const STATIC_CACHE = 'lunerie-static-v1';
const RUNTIME_CACHE = 'lunerie-runtime-v1';
const API_HOSTS = [
  'nominatim.openstreetmap.org',
  'overpass-api.de',
  'secure.geonames.org',
  'restcountries.com',
  'api.pexels.com',
  'api.unsplash.com',
  'images.pexels.com',
  'images.unsplash.com',
  'tile.openstreetmap.org',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.addAll([
        '/',
        '/manifest.webmanifest',
        '/favicon.svg',
      ]),
    ),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => ![STATIC_CACHE, RUNTIME_CACHE].includes(key))
          .map((key) => caches.delete(key)),
      ),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);
  const isApiHost = API_HOSTS.includes(url.hostname);

  if (isApiHost) {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(cacheFirst(request));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  const response = await fetch(request);
  const cache = await caches.open(RUNTIME_CACHE);
  cache.put(request, response.clone());
  return response;
}

async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);

  try {
    const response = await fetch(request);
    cache.put(request, response.clone());
    return response;
  } catch {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }

    throw new Error('Network unavailable and no cached response exists.');
  }
}
