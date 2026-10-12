// Prima la rete (così si vede sempre l'ultima edizione), poi la copia salvata se si è offline.
const CACHE = "rassegna-v1";
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(["./", "manifest.webmanifest", "icone/icon-192.png"])));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== CACHE).map(n => caches.delete(n)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin && !url.hostname.endsWith("fonts.googleapis.com") && !url.hostname.endsWith("fonts.gstatic.com")) return;
  e.respondWith(
    fetch(req, { cache: "no-cache" }).then(r => {
      if (r.ok || r.type === "opaque") { const copia = r.clone(); caches.open(CACHE).then(c => c.put(req, copia)); }
      return r;
    }).catch(() => caches.match(req).then(r => r || caches.match("./")))
  );
});
