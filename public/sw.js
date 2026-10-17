/*
 * FYN Tools service worker.
 *
 * Important: Next.js deployment assets are versioned by build ID. Caching
 * navigations or arbitrary same-origin responses here can keep old HTML alive
 * after a deployment, causing it to request chunks that no longer exist.
 * Keep navigations/network content fresh and only use a safe offline fallback.
 */
const CACHE_PREFIX = 'fyn-tools-';
const CACHE_VERSION = 'v2';
const STATIC_CACHE = CACHE_PREFIX + 'static-' + CACHE_VERSION;
const OFFLINE_URL = '/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.add(OFFLINE_URL))
      .catch(() => undefined)
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => Promise.all(
      names
        .filter((name) => name.startsWith(CACHE_PREFIX) && name !== STATIC_CACHE)
        .map((name) => caches.delete(name))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Never intercept Next.js chunks, image optimization, API responses, or
  // navigations. They must always follow the deployed version's network path.
  if (
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/api/') ||
    request.mode === 'navigate'
  ) {
    if (request.mode === 'navigate') {
      event.respondWith(
        fetch(request).catch(async () => {
          const cached = await caches.match(OFFLINE_URL);
          return cached || Response.error();
        })
      );
    }
    return;
  }

  // Do not runtime-cache HTML or arbitrary responses. This worker only keeps a
  // versioned offline fallback; normal assets use the browser/CDN cache policy.
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(Promise.resolve());
  }
});

self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New tool available!',
    icon: '/logobeta-128.webp',
    badge: '/logobeta-64.webp',
    data: { url: '/' },
  };
  event.waitUntil(self.registration.showNotification('FYN Tools', options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL(
    event.notification.data && event.notification.data.url || '/',
    self.location.origin
  ).href;
  event.waitUntil(self.clients.openWindow(target));
});
