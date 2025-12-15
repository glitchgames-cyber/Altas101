const CACHE_NAME = 'india-tech-atlas-v3';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './past.html',
  './present.html',
  './future.html',
  './games.html',
  './login.html',
  './vault.html',
  './funding.html',
  './launch.html',
  './impossible.html',
  './memory3d.html',
  './reaction.html',
  './puzzle.html',
  './agriculture.html',
  './404.html',
  './about.html',
  './opensearch.xml',
  './api-docs.xml',
  './feed.xml',
  './games-data.xml',
  './config.xml',
  './data-export.xml',
  './resources.html',
  './blog.html',
  './search.html',
  './stats.html',
  './help.html',
  './policy.html',
  './terms.html',
  './innovation.html',
  './style.css',
  './css/base.css',
  './css/themes.css',
  './css/layout.css',
  './css/components.css',
  './css/games.css',
  './critical-styles.css',
  './script.js',
  './js/timeline.js',
  './js/match-game.js',
  './js/lab.js',
  './js/ai-stories.js',
  './js/utils.js',
  './funding.js',
  './launch.js',
  './impossible.js',
  './memory3d.js',
  './reaction.js',
  './puzzle.js',
  './agriculture.js',
  './blog.js',
  './search.js',
  './stats.js',
  './policy.js',
  './terms.js',
  './innovation.js',
  './logbook.js',
  './vault.js',
  './export-utils.js',
  './export-docx.js',
  './export-xlsx.js',
  './export-xml.js',
  './critical-fallback.js',
  './backup-storage.js',
  './error-recovery.js',
  './health-check.js',
  './fallback-system.js',
  './theme-toggle.js',
  './funding-data.js',
  './games-data.js',
  './quiz-questions.json',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&display=swap'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {
        console.log('Some assets could not be cached during install');
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          return new Response('Offline - Resource not available', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
    })
  );
});
