const CACHE_NAME = 'actividades-v2';
const ASSETS = [
  './',
  './index.html'
];

// Instalar y forzar activación inmediata
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Borrar cachés viejos (actividades-v1) inmediatamente
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia Network-First: Intenta descargar de internet; si no hay red, usa la memoria
self.addEventListener('fetch', (e) => {
  if (e.request.method === 'GET') {
    e.respondWith(
      fetch(e.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy));
          }
          return response;
        })
        .catch(() => caches.match(e.request))
    );
  }
});
