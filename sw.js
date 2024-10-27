const VERSION = "v2"
const CACHE_NAME = `my-memory-${VERSION}`
const APP_STATIC_RESOURCES = [
    "/index.html",
    "/main.js",
    "/manifest.json",
    "/sw.js",
    "/style.css",
    "/favicon.webp",
]

async function preloadAndCacheStaticResources() {
    const cache = await caches.open(CACHE_NAME)
    await cache.addAll(APP_STATIC_RESOURCES)
}

self.addEventListener("install", (event) => {
    event.waitUntil(preloadAndCacheStaticResources())
})

async function deleteOutdatedCacheEntries() {
    const names = await caches.keys()
    const outdatedNames = names.filter(name => name !== CACHE_NAME)
    await Promise.all(outdatedNames.map((name) => caches.delete(name)))
}

async function activateServiceWorker() {
    await deleteOutdatedCacheEntries()
    await clients.claim()
}

self.addEventListener("activate", (event) => {
    event.waitUntil(activateServiceWorker())
})

async function cacheFirst(request) {
    const cache = await caches.open(CACHE_NAME)
    const cachedResponse = await cache.match(request)
    if (cachedResponse) {
        return cachedResponse
    }
    const response = await fetch(request)
    await cache.put(request, response.clone())
    return response
}

async function networkFirst(request) {
    const cache = await caches.open(CACHE_NAME)

    try {
        const response = await fetch(request)
        await cache.put(request, response.clone())
        return response
    } catch {
        const cache = await caches.open(CACHE_NAME)
        const cachedResponse = await cache.match(request)
        if (cachedResponse) {
            return cachedResponse
        }
    }
    return new Response("Network error", {
        status: 408,
        headers: {"Content-Type": "text/plain"},
    });
}

self.addEventListener("fetch", (event) => {
    if (event.request.mode === "navigate") {
        event.respondWith(caches.match("/index.html"))
    } else if (APP_STATIC_RESOURCES.some(resourceUrl => event.request.url.endsWith(resourceUrl))) {
        event.respondWith(networkFirst(event.request))
    } else {
        event.respondWith(cacheFirst(event.request))
    }
})