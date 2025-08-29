
const CACHE_NAME = 'ppl-cache-v4';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k === CACHE_NAME ? null : caches.delete(k)))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(resp => {
        const respClone = resp.clone();
        caches.open(CACHE_NAME).then(cache => {
          // Only cache GETs and same-origin requests
          if (request.method === 'GET' && new URL(request.url).origin === location.origin) {
            cache.put(request, respClone);
          }
        });
        return resp;
      }).catch(() => caches.match('./index.html'));
    })
  );
});
