const CACHE_NAME = 'search-portal-v8';
const ASSETS = [
    '/',
    '/index.html',
    '/css/style.css',
    '/css/base.css',
    '/css/themes.css',
    '/css/dock.css',
    '/css/layouts.css',
    '/css/widgets.css',
    '/js/main.js',
    '/js/config.js',
    '/js/state.js',
    '/js/themes.js',
    '/js/dock.js',
    '/js/search.js',
    '/js/clock.js',
    '/js/layouts.js',
    '/js/widgets.js',
    '/js/screensaver.js',
    '/particles.js-master/particles.min.js',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Oswald:wght@200;300;400;500&family=JetBrains+Mono:wght@400;500&display=swap',
    'https://fonts.googleapis.com/icon?family=Material+Icons'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS).catch((err) => {
                console.warn('Cache failed for some assets:', err);
            });
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
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
    return self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((response) => {
            if (response) {
                return response;
            }
            return fetch(e.request).then((response) => {
                // Cache Google Fonts resources dynamically
                if (e.request.url.includes('fonts.googleapis.com') ||
                    e.request.url.includes('fonts.gstatic.com')) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(e.request, responseClone);
                    });
                }
                return response;
            }).catch(() => {
                return new Response('Offline');
            });
        })
    );
});
