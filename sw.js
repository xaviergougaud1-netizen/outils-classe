// Portail « Outils de classe partagés » et « Ma classe » : fonctionnement hors ligne.
// Changer CACHE à chaque nouvelle version (en même temps que VERSION dans index.html).
// Les outils qui ont leur propre sw.js (correcteur/, problemes/, orienter/) gardent le leur : il est prioritaire dans leur dossier.
const CACHE = "portail-1.1.0";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png",
  "./ma-classe/", "./ma-classe/index.html", "./commun/charte.css", "./commun/ma-classe.js", "./commun/kit-db.js",
  "./groupes/", "./groupes/index.html", "./plan/", "./plan/index.html"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  // Supprime les anciens caches du portail (et l'ancien « correcteur-2.3.0 » laissé par une ancienne page d'accueil).
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(key => key.startsWith("portail-") && key !== CACHE || key === "correcteur-2.3.0").map(key => caches.delete(key))))
    .then(() => self.clients.claim()));
});

// Réseau d'abord (mises à jour rapides), copie enregistrée si hors ligne. Police : copie enregistrée d'abord.
self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET") return;
  if (/fonts\.(googleapis|gstatic)\.com/.test(req.url)) {
    event.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res;
    })));
    return;
  }
  if (new URL(req.url).origin !== location.origin) return;
  event.respondWith(fetch(req).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req, {ignoreSearch: true}).then(hit => hit || (req.mode === "navigate" ? caches.match("./index.html") : undefined))));
});
