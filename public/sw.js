// Minimal Service Worker to satisfy PWA requirements
const CACHE_NAME = 'stitch-v1';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
    // Pass through fetch for now
    event.respondWith(fetch(event.request));
});
