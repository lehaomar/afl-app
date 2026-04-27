// AFL Service Worker — network-first, no JS/CSS caching
const CACHE = 'afl-v4';
const SHELL = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET, same-origin
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // JS/CSS bundles: always network (they have hash names, HTTP cache handles them)
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(fetch(request));
    return;
  }

  // API: network only
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request));
    return;
  }

  // Uploads: network only
  if (url.pathname.startsWith('/uploads/')) {
    event.respondWith(fetch(request));
    return;
  }

  // Shell (/, /index.html, /manifest.json): network first, cache fallback
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
