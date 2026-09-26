/* BrickCode PWA Offline Service Worker
 * Provides robust offline caching for BrickCode web editor with Network-First strategy
 */

const CACHE_NAME = 'brickcode-pwa-v4';

self.addEventListener('install', (event) => {
    // Force immediate activation
    self.skipWaiting();

    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            const scope = self.registration.scope;
            const assets = [
                scope,
                new URL('index.html', scope).href,
                new URL('ev3-community.js', scope).href,
                new URL('ev3-community.css', scope).href,
                new URL('pxtapp.js', scope).href,
                new URL('target.js', scope).href,
                new URL('editor.js', scope).href,
                new URL('semantic.css', scope).href,
                new URL('semantic.js', scope).href,
                new URL('icons.css', scope).href,
                new URL('overrides/ev3-dark-overrides.css', scope).href,
                new URL('overrides/ev3-light-overrides.css', scope).href
            ];

            return Promise.allSettled(
                assets.map((assetUrl) =>
                    fetch(assetUrl, { cache: 'no-cache' }).then((res) => {
                        if (res.ok) {
                            return cache.put(assetUrl, res);
                        }
                    }).catch(() => {})
                )
            );
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('Purging old PWA cache:', key);
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);
    if (url.pathname.startsWith('/api/')) return;

    // Network-First with offline cache fallback:
    // Guarantees updates (themes, code, translations) apply immediately when online,
    // while maintaining full offline availability when disconnected.
    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const clone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, clone);
                    });
                }
                return networkResponse;
            })
            .catch(() => {
                // Network unavailable -> serve from offline cache
                return caches.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) return cachedResponse;

                    if (event.request.mode === 'navigate') {
                        const scope = self.registration.scope;
                        return caches.match(scope)
                            .then((res) => res || caches.match(new URL('index.html', scope).href));
                    }
                });
            })
    );
});
