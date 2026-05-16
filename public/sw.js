/* Nimbus Service Worker
 * Strategy:
 *   - Precache the app shell (navigation routes + brand icons + manifest) on install.
 *   - For navigations (HTML): network-first, fall back to cached shell, then /offline.
 *   - For same-origin static GETs: stale-while-revalidate.
 *   - Skip: cross-origin, non-GET, /api/*, Appwrite, query-string requests, server actions.
 */

const CACHE_VERSION = "nimbus-v1";
const SHELL_CACHE = `${CACHE_VERSION}-shell`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const OFFLINE_URL = "/offline";

const PRECACHE_URLS = [
  "/",
  "/login",
  "/register",
  "/dashboard",
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/icon",
  "/apple-icon",
  "/icon-512",
  "/assets/icons/logo-brand.svg",
  "/assets/icons/logo-full-brand.svg",
  "/assets/icons/logo-full.svg",
  "/assets/icons/dashboard.svg",
  "/assets/icons/documents.svg",
  "/assets/icons/images.svg",
  "/assets/icons/video.svg",
  "/assets/icons/others.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      // Use individual adds so one 404 doesn't fail the whole install.
      await Promise.all(
        PRECACHE_URLS.map(async (url) => {
          try {
            const res = await fetch(url, { credentials: "same-origin" });
            if (res && res.ok) {
              await cache.put(url, res.clone());
            }
          } catch {
            /* ignore individual precache failures */
          }
        }),
      );
      self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => k !== SHELL_CACHE && k !== RUNTIME_CACHE)
          .map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

function isCacheableRequest(request) {
  if (request.method !== "GET") return false;
  const url = new URL(request.url);
  // Same-origin only
  if (url.origin !== self.location.origin) return false;
  // Skip API + auth routes + server actions
  if (url.pathname.startsWith("/api/")) return false;
  // Skip anything that looks like a server action / data fetch with query
  if (url.search && url.search.length > 0) return false;
  // Skip Next.js data fetches
  if (url.pathname.startsWith("/_next/data/")) return false;
  return true;
}

function isNavigationRequest(request) {
  return (
    request.mode === "navigate" ||
    (request.method === "GET" &&
      request.headers.get("accept")?.includes("text/html"))
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never intercept API / auth / server actions
  if (url.pathname.startsWith("/api/")) return;

  // Navigations: network-first with offline fallback
  if (isNavigationRequest(request)) {
    event.respondWith(
      (async () => {
        try {
          const networkRes = await fetch(request);
          // Cache successful navigations for shell fallback (no query strings)
          if (networkRes && networkRes.ok && !url.search) {
            const cache = await caches.open(SHELL_CACHE);
            cache.put(request, networkRes.clone()).catch(() => {});
          }
          return networkRes;
        } catch {
          const cached = await caches.match(request);
          if (cached) return cached;
          const offline = await caches.match(OFFLINE_URL);
          if (offline) return offline;
          return new Response(
            "<h1>Offline</h1><p>You're offline and no cached page is available.</p>",
            { headers: { "Content-Type": "text/html; charset=utf-8" }, status: 503 },
          );
        }
      })(),
    );
    return;
  }

  // Static GETs: stale-while-revalidate
  if (!isCacheableRequest(request)) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(RUNTIME_CACHE);
      const cached = await cache.match(request);
      const networkPromise = fetch(request)
        .then((res) => {
          if (res && res.ok) {
            cache.put(request, res.clone()).catch(() => {});
          }
          return res;
        })
        .catch(() => null);

      if (cached) {
        // Kick off revalidation in the background.
        event.waitUntil(networkPromise);
        return cached;
      }
      const network = await networkPromise;
      if (network) return network;
      // Final fallback — let it fail naturally.
      return fetch(request);
    })(),
  );
});

// Allow page to trigger skipWaiting via postMessage if we ever add an update UI.
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
