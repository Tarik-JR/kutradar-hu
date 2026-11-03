const CACHE = 'kutradar-demo-v1';
const APP_FILES = [
  './','./index.html','./src/styles.css','./src/responsive.css','./src/app.js',
  './src/data/cities.js','./src/data/brands.js','./src/data/fuels.js',
  './src/data/stations.js','./src/data/mock-prices.js','./src/data/provider.js',
  './src/lib/geo.js','./src/lib/cost.js','./src/lib/filter.js',
  './src/lib/format.js','./src/lib/i18n.js','./src/lib/storage.js',
  './src/ui/map.js','./src/ui/layout.js','./src/ui/cards.js','./src/ui/detail.js',
  './public/icon.svg','./public/manifest.webmanifest',
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(APP_FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE && key.startsWith('kutradar-demo-')).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(cache => cache.put(event.request, copy)); }
    return res;
  })));
});
