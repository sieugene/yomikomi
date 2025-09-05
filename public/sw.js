const CACHE_NAME = "yomikomi-v1";
const OFFLINE_URL = "/offline";

const STATIC_CACHE_URLS = ["/", "/offline", "/manifest.json"];

const KUROMOJI_RESOURCES = [
  "/kuromoji/base.dat.gz",
  "/kuromoji/cc.dat.gz",
  "/kuromoji/check.dat.gz",
  "/kuromoji/tid_map.dat.gz",
  "/kuromoji/tid_pos.dat.gz",
  "/kuromoji/tid.dat.gz",
  "/kuromoji/unk_char.dat.gz",
  "/kuromoji/unk_compat.dat.gz",
  "/kuromoji/unk_invoke.dat.gz",
  "/kuromoji/unk_map.dat.gz",
  "/kuromoji/unk_pos.dat.gz",
  "/kuromoji/unk.dat.gz",
];

const WASM_RESOURCES = [
  "/sql.js/sql-wasm.wasm",
  "/sql.js/sql-wasm.js",
  "/zstd/zstd_wasm_bg.wasm",
];

const PRECACHE_URLS = [
  ...STATIC_CACHE_URLS,
  ...KUROMOJI_RESOURCES,
  ...WASM_RESOURCES,
];

// Установка Service Worker
self.addEventListener("install", (event) => {
  console.log("[SW] Install event");

  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);

        // Кэшируем основные ресурсы
        console.log("[SW] Caching static resources");
        await cache.addAll(STATIC_CACHE_URLS);

        // Кэшируем Kuromoji файлы с обработкой ошибок
        console.log("[SW] Caching Kuromoji resources");
        for (const url of KUROMOJI_RESOURCES) {
          try {
            await cache.add(url);
          } catch (error) {
            console.warn(`[SW] Failed to cache ${url}:`, error);
          }
        }

        // Кэшируем WASM файлы
        console.log("[SW] Caching WASM resources");
        for (const url of WASM_RESOURCES) {
          try {
            await cache.add(url);
          } catch (error) {
            console.warn(`[SW] Failed to cache ${url}:`, error);
          }
        }

        console.log("[SW] All resources cached successfully");
      } catch (error) {
        console.error("[SW] Failed to cache resources:", error);
      }
    })()
  );

  // Принудительная активация нового SW
  self.skipWaiting();
});

// Активация Service Worker
self.addEventListener("activate", (event) => {
  console.log("[SW] Activate event");

  event.waitUntil(
    (async () => {
      // Удаляем старые кэши
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => {
            console.log("[SW] Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          })
      );

      // Захватываем управление всеми клиентами
      await clients.claim();
    })()
  );
});

// Обработка fetch запросов
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Пропускаем не-GET запросы и chrome-extension
  if (request.method !== "GET" || url.protocol.includes("chrome-extension")) {
    return;
  }

  event.respondWith(handleFetchRequest(request));
});

async function handleFetchRequest(request) {
  const url = new URL(request.url);

  try {
    // Стратегия Cache First для статических ресурсов
    if (shouldCacheFirst(url.pathname)) {
      return await cacheFirst(request);
    }

    // Стратегия Network First для API и динамического контента
    if (shouldNetworkFirst(url.pathname)) {
      return await networkFirst(request);
    }

    // Стратегия Stale While Revalidate для остального
    return await staleWhileRevalidate(request);
  } catch (error) {
    console.error("[SW] Fetch error:", error);

    // Возвращаем офлайн страницу для навигационных запросов
    if (request.mode === "navigate") {
      const cache = await caches.open(CACHE_NAME);
      return (await cache.match(OFFLINE_URL)) || new Response("Offline");
    }

    return new Response("Network Error", { status: 500 });
  }
}

function shouldCacheFirst(pathname) {
  return (
    pathname.startsWith("/kuromoji/") ||
    pathname.endsWith(".wasm") ||
    pathname.startsWith("/_next/static/") ||
    pathname.endsWith(".js") ||
    pathname.endsWith(".css") ||
    pathname.startsWith("/icons/")
  );
}

function shouldNetworkFirst(pathname) {
  return (
    pathname.startsWith("/api/") || pathname.includes("/_next/webpack-hmr")
  );
}

// Cache First стратегия
async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  if (cached) {
    return cached;
  }

  const response = await fetch(request);

  if (response.ok) {
    cache.put(request, response.clone());
  }

  return response;
}

// Network First стратегия
async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request);

    if (response.ok) {
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}

// Stale While Revalidate стратегия
async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => {
      // Игнорируем сетевые ошибки при фоновом обновлении
    });

  return cached || (await fetchPromise);
}

// Обработка сообщений от клиента
self.addEventListener("message", (event) => {
  const { type, payload } = event.data;

  switch (type) {
    case "GET_CACHE_STATUS":
      handleGetCacheStatus(event);
      break;
    case "CLEAR_CACHE":
      handleClearCache(event);
      break;
    case "PRECACHE_RESOURCE":
      handlePrecacheResource(event, payload);
      break;
    default:
      console.warn("[SW] Unknown message type:", type);
  }
});

async function handleGetCacheStatus(event) {
  try {
    const cache = await caches.open(CACHE_NAME);
    const keys = await cache.keys();
    const status = {
      cacheSize: keys.length,
      kuromojiCached: KUROMOJI_RESOURCES.every(async (url) => {
        const response = await cache.match(url);
        return response !== undefined;
      }),
    };

    event.ports[0].postMessage({ success: true, data: status });
  } catch (error) {
    event.ports[0].postMessage({ success: false, error: error.message });
  }
}

async function handleClearCache(event) {
  try {
    const deleted = await caches.delete(CACHE_NAME);
    event.ports[0].postMessage({ success: true, data: { deleted } });
  } catch (error) {
    event.ports[0].postMessage({ success: false, error: error.message });
  }
}

async function handlePrecacheResource(event, { url }) {
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.add(url);
    event.ports[0].postMessage({ success: true, data: { cached: url } });
  } catch (error) {
    event.ports[0].postMessage({ success: false, error: error.message });
  }
}
