// Fonctionnement hors ligne de l'appli installée.
// Changer CACHE à chaque nouvelle version (en même temps que VERSION dans index.html).
const CACHE = "orienter-1.3.1";
const FILES = ["./", "./index.html", "./donnees.js", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(key => key.startsWith("orienter-") && key !== CACHE).map(key => caches.delete(key))))
    .then(() => self.clients.claim()));
});
// Fichiers de l'appli : réseau d'abord, copie enregistrée si hors ligne. Police : copie d'abord.
self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  if (/fonts\.(googleapis|gstatic)\.com/.test(req.url)) {
    event.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res; })));
    return;
  }
  if (new URL(req.url).origin !== location.origin) return;
  event.respondWith(fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req.mode === "navigate" ? "./index.html" : req, copy)); }
    return res;
  }).catch(() => caches.match(req.mode === "navigate" ? "./index.html" : req, {ignoreSearch: true})));
});
