/* ============================================================
   Lingohub PWA Service Worker
   - Offline rejim: asosiy sahifa va statik resurslar keshda
   - Push notifikatsiyalar: serverdan push kelganda ko'rsatish
   ============================================================ */
// v2: optimallashtirilgan logo + yangi app shell uchun eski keshlarni yangilash.
// Har bir muhim deploy'da bu raqamni oshiring — aks holda eski (katta) fayllar
// cache-first qoidasi tufayli foydalanuvchida abadiy qolib ketishi mumkin.
const CACHE_NAME = 'lingohub-v2';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/logo.png',
  '/site.webmanifest',
  '/favicon-192x192.png',
  '/favicon-512x512.png',
];

// O'rnatish: asosiy fayllarni keshlash
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
      .catch(() => {}) // offline o'rnatishda — xato bo'lsa ham davom etamiz
  );
});

// Faollash: eski keshlarni tozalash
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// So'rovlar: navigatsiya uchun network-first (offline bo'lsa — kesh),
// statik fayllar uchun cache-first.
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // API so'rovlarini keshlash shart emas
  if (url.pathname.startsWith('/api/')) return;

  // Navigatsiya (sahifa ochish)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
          return response;
        })
        .catch(() => caches.match(request).then((r) => r || caches.match('/index.html')))
    );
    return;
  }

  // Statik resurslar — cache-first, keyin tarmoq
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
        }
        return response;
      });
    })
  );
});

// Push xabarlarini qabul qilish
self.addEventListener('push', (event) => {
  let data = { title: 'Lingohub', body: 'Yangi xabar!', icon: '/favicon-192x192.png', url: '/' };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    /* oddiy matn bo'lsa ham qabul qilamiz */
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/favicon-192x192.png',
      badge: '/favicon-192x192.png',
      data: { url: data.url || '/' },
    })
  );
});

// Bildirishnoma bosilganda saytni ochish
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ('focus' in client) return client.navigate(url).then(() => client.focus());
      }
      return self.clients.openWindow(url);
    })
  );
});
