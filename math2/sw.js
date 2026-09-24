// Minimal cache-first service worker for offline play.
const CACHE = 'math2-v1';
const ASSETS = [
    './',
    './Maths_Champions.html',
    './Maths_Champions.js',
    './styles.css',
    './manifest.webmanifest',
    './favicon.svg',
];

self.addEventListener('install', (e) => {
    e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).catch(() => { }));
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
    );
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET') return;
    e.respondWith(
        caches.match(e.request).then((r) => r || fetch(e.request).then((resp) => {
            const clone = resp.clone();
            caches.open(CACHE).then((c) => c.put(e.request, clone)).catch(() => { });
            return resp;
        }).catch(() => caches.match('./Maths_Champions.html')))
    );
});
