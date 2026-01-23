self.addEventListener("install", (e) => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  clients.claim();
});

// Network-first untuk HTML, cache-first untuk aset statis
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.mode === "navigate") {
    event.respondWith(fetch(req).catch(() => caches.match("./")));
    return;
  }

  if (url.origin === location.origin) {
    event.respondWith(
      caches.open("static-v1").then((cache) => {
        return cache.match(req).then((res) => {
          const fetchPromise = fetch(req)
            .then((networkRes) => {
              cache.put(req, networkRes.clone());
              return networkRes;
            })
            .catch(() => res);
          return res || fetchPromise;
        });
      })
    );
  }
});
