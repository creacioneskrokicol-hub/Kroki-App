const CACHE_NAME = "krokicol-v5";

const ARCHIVOS = [
    "./",
    "./index.html",
    "./productos.html",
    "./style.css",
    "./app.js",
    "./productos.js",
    "./manifest.json"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ARCHIVOS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        caches.match(event.request, { ignoreSearch: true })
            .then((respuesta) => {
                if (respuesta) {
                    return respuesta;
                }

                return fetch(event.request).then((respuestaRed) => {
                    const copia = respuestaRed.clone();

                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, copia);
                    });

                    return respuestaRed;
                });
            })
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((nombres) =>
            Promise.all(
                nombres
                    .filter((nombre) => nombre !== CACHE_NAME)
                    .map((nombre) => caches.delete(nombre))
            )
        ).then(() => self.clients.claim())
    );
});