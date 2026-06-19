// Service Worker for BizPlan Academy
// Utilise Workbox pour la gestion du cache et du mode hors ligne

importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');

if (workbox) {
  console.log('Workbox est chargé avec succès.');

  // Configuration du niveau de verbosité
  workbox.setConfig({ debug: false });

  // Cache pour l'index, les fichiers JS et CSS principaux au lancement
  workbox.precaching.precacheAndRoute([
    { url: '/', revision: '1' },
    { url: '/index.html', revision: '1' },
    { url: '/src/main.tsx', revision: '1' },
    { url: '/src/index.css', revision: '1' },
    { url: '/src/App.tsx', revision: '1' }
  ]);

  // Stratégie Stale-While-Revalidate pour les pages HTML, les scripts et les feuilles de style (les sert du cache, puis met à jour en tâche de fond)
  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'document' || 
                     request.destination === 'script' || 
                     request.destination === 'style',
    new workbox.strategies.StaleWhileRevalidate({
      cacheName: 'bizplan-static-assets',
    })
  );

  // Stratégie Cache First pour les images (ex: logo, icônes)
  workbox.routing.registerRoute(
    ({ request }) => request.destination === 'image',
    new workbox.strategies.CacheFirst({
      cacheName: 'bizplan-images',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 jours
        }),
      ],
    })
  );

  // Stratégie Network First pour tout appel externe de CDN (ex: Google Fonts)
  workbox.routing.registerRoute(
    ({ url }) => url.origin === 'https://fonts.googleapis.com' || 
                 url.origin === 'https://fonts.gstatic.com' ||
                 url.origin === 'https://img.icons8.com',
    new workbox.strategies.NetworkFirst({
      cacheName: 'bizplan-external-fonts-and-icons',
      plugins: [
        new workbox.expiration.ExpirationPlugin({
          maxEntries: 20,
        }),
      ],
    })
  );

  // Événement hors ligne fallback optionnel personnalisé
  self.addEventListener('fetch', (event) => {
    // Si la requête échoue et qu'on cherche l'URL root, on peut renvoyer la version en cache
    if (event.request.mode === 'navigate') {
      event.respondWith(
        fetch(event.request).catch(() => {
          return caches.match('/');
        })
      );
    }
  });

  // Mise à jour automatique du Service Worker
  self.addEventListener('install', () => {
    self.skipWaiting();
    console.log('BizPlan Academy Service Worker installé.');
  });

  self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
    console.log('BizPlan Academy Service Worker activé.');
  });

} else {
  console.log('Échec du chargement de Workbox.');
}
