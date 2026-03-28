/**
 * Service Worker — Consultes IT PWA
 * Estratègia:
 *  - Cache-first per a assets estàtics (JS, CSS, imatges, fonts)
 *  - Network-first per a peticions API (tRPC, OAuth)
 *  - Cache-first amb fallback offline per a rutes de navegació (HTML shell)
 */

const CACHE_NAME = "consultesit-v1";
const OFFLINE_URL = "/";

// Assets que es precachen en instal·lar el SW
const PRECACHE_ASSETS = [
  "/",
  "/casos-especials",
  "/documents",
  "/calculadora",
  "/reclamacions",
  "/manifest.webmanifest",
  "/favicon.ico",
  "/favicon-32x32.png",
  "/favicon-16x16.png",
  "/apple-touch-icon.png",
];

// ── Instal·lació: precache de les rutes principals ──────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── Activació: neteja de caches antigues ────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ── Fetch: estratègia per tipus de petició ──────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorem peticions no-GET i peticions a dominis externs (analytics, OAuth, CDN)
  if (request.method !== "GET") return;
  if (url.origin !== self.location.origin) return;

  // Peticions API → network-first (mai des de cache)
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request).catch(() => {
        // Si no hi ha xarxa i és una petició API, retornem un error JSON
        return new Response(
          JSON.stringify({ error: "Sin conexión. Comprueba tu red." }),
          {
            status: 503,
            headers: { "Content-Type": "application/json" },
          }
        );
      })
    );
    return;
  }

  // Assets estàtics (JS, CSS, imatges, fonts) → cache-first
  const isStaticAsset =
    url.pathname.match(/\.(js|css|png|jpg|jpeg|svg|ico|woff2?|ttf|webp)$/) ||
    url.pathname.startsWith("/assets/");

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Navegació HTML (rutes SPA) → network-first amb fallback a cache
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() =>
          // Sense xarxa: retornem el shell de l'app des de cache
          caches.match(OFFLINE_URL).then(
            (cached) =>
              cached ||
              new Response(
                `<!DOCTYPE html>
<html lang="ca">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Consultes IT — Sense connexió</title>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; align-items: center;
           justify-content: center; min-height: 100vh; margin: 0;
           background: #0f172a; color: #e2e8f0; text-align: center; padding: 2rem; }
    h1 { font-size: 1.5rem; margin-bottom: 1rem; }
    p { color: #94a3b8; margin-bottom: 1.5rem; }
    button { background: #3b82f6; color: white; border: none; padding: .75rem 1.5rem;
             border-radius: .5rem; cursor: pointer; font-size: 1rem; }
  </style>
</head>
<body>
  <div>
    <h1>Sense connexió</h1>
    <p>No s'ha pogut carregar la pàgina. Comprova la connexió a internet i torna-ho a intentar.</p>
    <button onclick="location.reload()">Tornar a intentar</button>
  </div>
</body>
</html>`,
                { headers: { "Content-Type": "text/html; charset=utf-8" } }
              )
          )
        )
    );
    return;
  }
});
