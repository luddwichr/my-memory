const VERSION = "v1"
const CACHE_NAME = `my-memory-${VERSION}`
const APP_STATIC_RESOURCES = [
    "/index.html",
    "/main.js",
    "/style.css",
    "/favicon.webp",
]

self.addEventListener("install", (event) => {
    event.waitUntil(
        (async () => {
            const cache = await caches.open(CACHE_NAME)
            await cache.addAll(APP_STATIC_RESOURCES)
        })()
    )
})

self.addEventListener("activate", (event) => {
    event.waitUntil(
        (async () => {
            const names = await caches.keys()
            const outdatedNames = names.filter(name => name !== CACHE_NAME)
            await Promise.all(outdatedNames.map((name) => caches.delete(name)))
            await clients.claim()
        })()
    )
})

self.addEventListener("fetch", (event) => {
    if (event.request.mode === "navigate") {
        event.respondWith(caches.match("/index.html"))
    } else {
        event.respondWith((async () => {
                const cache = await caches.open(CACHE_NAME)
                const cachedResponse = await cache.match(event.request)
                if (cachedResponse) {
                    return cachedResponse
                }
                const response = await fetch(event.request)
                await cache.put(event.request, response.clone())
                return response
            })()
        )
    }
})