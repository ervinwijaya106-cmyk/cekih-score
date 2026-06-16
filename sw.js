/* ============================================================
   SCORE CEKIH — Service Worker — Sadewa Corp
   ============================================================ */
'use strict';

const CACHE_NAME = 'score-cekih-v7';

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  '/images/background.png',
  '/images/joker.png',
  '/images/joker.ico',
  '/images/border_1.png',
  '/images/border_2.png',
  '/images/border_3.png',
  '/images/border_4.png',
  '/images/animal_1.png',
  '/images/animal_2.png',
  '/images/animal_3.png',
  '/images/animal_4.png',
  '/audio/casino_bg.mp3',
  '/audio/mulai_dari_0_ya_bapak.wav',
  '/audio/kok_minus_terus_sih_gamau_menang.wav',
  '/audio/klik.wav',
  '/video/dragon.mp4',
  '/video/tiger.mp4',
  '/video/eagle.mp4',
  '/video/cobra.mp4'
];

// INSTALL — cache all assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Cache one by one to avoid failing entire install if one asset is missing
      return Promise.allSettled(
        ASSETS_TO_CACHE.map(url =>
          cache.add(url).catch(err => {
            console.warn('[SW] Failed to cache:', url, err);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// ACTIVATE — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// FETCH — cache-first strategy with network fallback
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip chrome-extension and non-http requests
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).then((response) => {
        // Cache valid responses
        if (response && response.status === 200 && response.type !== 'opaque') {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      }).catch(() => {
        // Return offline fallback for HTML
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/index.html');
        }
      });
    })
  );
});
