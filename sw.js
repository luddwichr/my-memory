const VERSION = "v4"
const CACHE_NAME = `my-memory-${VERSION}`
const INDEX_HTML_PATH = "./index.html";
const APP_STATIC_RESOURCES = [
    INDEX_HTML_PATH,
    "./main.js",
    "./manifest.json",
    "./sw.js",
    "./style.css",
    "./favicon.webp",
]

async function getCurrentCache() {
    return await caches.open(CACHE_NAME)
}

async function preloadAndCacheStaticResources() {
    const cache = await getCurrentCache()
    return cache.addAll(APP_STATIC_RESOURCES)
}

self.addEventListener("install", (event) => {
    event.waitUntil(preloadAndCacheStaticResources())
})

async function deleteOutdatedCacheEntries() {
    const names = await caches.keys()
    const outdatedNames = names.filter(name => name !== CACHE_NAME)
    return Promise.all(outdatedNames.map((name) => caches.delete(name)))
}

async function activateServiceWorker() {
    await deleteOutdatedCacheEntries()
    return clients.claim()
}

self.addEventListener("activate", (event) => {
    event.waitUntil(activateServiceWorker())
})

async function cacheFirst(request) {
    const cache = await getCurrentCache()
    const cachedResponse = await cache.match(request)
    if (cachedResponse) {
        return cachedResponse
    }
    const response = await fetch(request)
    await cache.put(request, response.clone())
    return response
}

function createNetworkErrorResponse() {
     return new Response("Network error", {
        status: 408,
        headers: {"Content-Type": "text/plain"},
    })
}

async function networkFirst(request) {
    const cache = await getCurrentCache()
    try {
        const response = await fetch(request)
        await cache.put(request, response.clone())
        return response
    } catch {
        const cachedResponse = await cache.match(request)
        if (cachedResponse) {
            return cachedResponse
        }
    }
    return createNetworkErrorResponse()
}

self.addEventListener("fetch", async (event) => {
    if (event.request.mode === "navigate") {
        event.respondWith(fetch(INDEX_HTML_PATH).catch(() => caches.match(INDEX_HTML_PATH)))
    } else {
        if (event.request.destination === "image") {
            event.respondWith(cacheFirst(event.request))
        } else {
            event.respondWith(networkFirst(event.request))
        }
    }
})