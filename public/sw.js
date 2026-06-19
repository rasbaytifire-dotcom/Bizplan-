const CACHE_NAME = 'bizplan-academy-cache-v3';
const PRE_CACHE_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// Installation: Pre-cache static shell resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRE_CACHE_RESOURCES);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Activation: Clean up old caches and claim current clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((allCacheNames) => {
      return Promise.all(
        allCacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetching: Serve from network with offline cache fallback
self.addEventListener('fetch', (event) => {
  // Only process standard GET requests to avoid cache-write errors
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Skip caching third-party or chrome-extension URLs where appropriate
  if (!url.origin.startsWith(self.location.origin) && !event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Clone and save success responses in runtime cache
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Fall back to offline cache on failure
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // For SPA routing, if HTML request fails, return cached index.html
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('/');
          }
        });
      })
  );
});
