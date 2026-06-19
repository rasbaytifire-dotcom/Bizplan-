// Service Worker minimal pour BizPlan Academy
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Stratégie Network First ou Cache First peut être ajoutée ici
  event.respondWith(fetch(event.request));
});
