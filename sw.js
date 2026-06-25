const CACHE_NAME = "quiz-anglais-v5";
const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./words.js",
  "./manifest.webmanifest",
  "./icon.svg"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.mode === "navigate" || request.url.endsWith("index.html")) {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse.clone()));
          return networkResponse;
        })
        .catch(() => caches.match(request).then((cachedResponse) => cachedResponse || caches.match("./index.html")))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      return cachedResponse || fetch(request).then((networkResponse) => {
        caches.open(CACHE_NAME).then((cache) => cache.put(request, networkResponse.clone()));
        return networkResponse;
      });
    })
  );
});
