// Cache names are isolated to this app's path on a shared GitHub Pages origin.
const CACHE_PREFIX = `kutradar-demo-${new URL(self.registration.scope).pathname}-`;
const CACHE = CACHE_PREFIX + 'v2-__BUILD_ID__';
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
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE && key.startsWith(CACHE_PREFIX)).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
const APP_URLS = new Set(APP_FILES.map(path => new URL(path, self.registration.scope).href));
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  // Match the shell without storing shared filters or other URL query parameters.
  const canonical = new URL(url.pathname, url.origin).href;
  if (!APP_URLS.has(canonical)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    try {
      // Prefer the deployed release; use the cached shell only without a network.
      const response = await fetch(event.request);
      if (response.ok) {
        try { await cache.put(canonical, response.clone()); } catch { /* storage quota */ }
      }
      return response;
    } catch {
      return (await cache.match(canonical)) || Response.error();
    }
  })());
});
