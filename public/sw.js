// Stitch Auto Shop - Always Fresh Service Worker
const CACHE_NAME = 'stitch-v3';

// We want the app to update as soon as a new SW is found
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
    // For a diagnostic app, we want "Network First" for almost everything
    // to ensure the user never sees stale ticket data.
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).catch(() => {
                return caches.match(event.request);
            })
        );
        return;
    }

    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});
