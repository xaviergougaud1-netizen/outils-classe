// Fonctionnement hors ligne de l'appli installée.
// Changer CACHE à chaque nouvelle version (en même temps que VERSION dans index.html).
const CACHE = "correcteur-2.3.0";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png",
  "../commun/charte.css", "../commun/fiches-calcul.js"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(key => key.startsWith("correcteur-") && key !== CACHE || key.startsWith("correcteur-1")).map(key => caches.delete(key))))
    .then(() => self.clients.claim()));
});

// Page et fichiers de l'appli : réseau d'abord (mises à jour rapides), copie enregistrée si hors ligne.
// Police (Google Fonts) : copie enregistrée d'abord, gardée après la première visite.
self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  const font = /fonts\.(googleapis|gstatic)\.com/.test(req.url);
  if (font) {
    event.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res;
    })));
    return;
  }
  if (new URL(req.url).origin !== location.origin) return;
  event.respondWith(fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req.mode === "navigate" ? "./index.html" : req, copy)); }
    return res;
  }).catch(() => caches.match(req.mode === "navigate" ? "./index.html" : req, {ignoreSearch: true})));
});
