// Nama cache (ubah versi jika update)
const CACHE_NAME = "kasir-cache-v1";

// File yang ingin di-cache saat instalasi SW
const ASSETS_TO_CACHE = [
  "/app-kasir/",                       // halaman utama
  "/app-kasir/index.html",
  "/app-kasir/manifest.json",
  "/app-kasir/assets/css/main.css",
  "/app-kasir/assets/js/app.js",
  "/app-kasir/assets/js/sw-register.js",
  "/app-kasir/assets/sound/beep.mp3",
  "/app-kasir/assets/sound/save.mp3",
  "/app-kasir/assets/sound/update.mp3",
  "/app-kasir/assets/sound/delete.mp3",
];

// Install SW dan cache aset
self.addEventListener("install", (event) => {
  console.log("[SW] Installing...");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Caching assets...");
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate SW dan hapus cache lama
self.addEventListener("activate", (event) => {
  console.log("[SW] Activated");
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[SW] Removing old cache", key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch: Network first, fallback cache
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
      	// jika response partial 206 jangan cache
      	if (!response || response.status === 206) {
      		return response;
      	}
        // Simpan ke cache versi baru
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
