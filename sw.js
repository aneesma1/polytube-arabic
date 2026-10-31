// PolyTube Arabic Service Worker with Auto-Update Mechanism
const CACHE_NAME = 'polytube-arabic-v1.6.0';
const PRECACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg'
];

// Install: Cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('Pre-cache partial failure:', err);
      });
    })
  );
});

// Activate: Clean up all previous cache versions and take control immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Listen for SKIP_WAITING signal from client (manual or auto-update on launch)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Fetch Strategy:
// 1. Navigation requests (index.html): Network-first with cache fallback
// 2. Static assets: Cache-first with network fallback
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Let YouTube, Google APIs, and non-GET requests pass through
  if (
    url.origin.includes('youtube.com') ||
    url.origin.includes('googlevideo.com') ||
    url.origin.includes('ytimg.com') ||
    url.origin.includes('googleapis.com') ||
    url.pathname.endsWith('.zip') ||
    event.request.method !== 'GET'
  ) {
    return;
  }

  // Navigation requests (HTML pages) -> Network first, fallback to cached index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        })
        .catch(() => {
          return caches.match('./index.html') || caches.match('./');
        })
    );
    return;
  }

  // Static assets (CSS, JS, Fonts, Images) -> Cache first, fallback to network
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const toCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, toCache);
        });
        return response;
      });
    })
  );
});
