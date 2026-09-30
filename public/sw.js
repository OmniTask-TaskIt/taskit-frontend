// TaskIt - Service Worker mínimo.
// Objetivo: permitir que la PWA sea instalable en el celular y dar una
// experiencia offline básica (shell + últimos assets visitados).
// No cachea llamadas a la API (/api/...) para no servir datos desactualizados.

const CACHE_VERSION = 'taskit-cache-v1';
const APP_SHELL = ['/', '/login', '/manifest.webmanifest', '/favicon.svg'];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL).catch(() => {
      // Si algún asset del shell falla (p.ej. en dev), no rompemos la instalación.
    }))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_VERSION).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Nunca interceptar llamadas a la API o a servicios externos (Google/GitHub/Azure).
  if (url.pathname.startsWith('/api/') || url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached);

      return cached || network;
    })
  );
});
