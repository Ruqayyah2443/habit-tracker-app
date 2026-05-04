// const CACHE_NAME = 'habit-tracker-v1';

// self.addEventListener('install', (event) => {
//   self.skipWaiting();
// });

// self.addEventListener('activate', (event) => {
//   event.waitUntil(
//     caches.keys().then((keys) => {
//       return Promise.all(
//         keys
//           .filter((key) => key !== CACHE_NAME)
//           .map((key) => caches.delete(key))
//       );
//     })
//   );
//   self.clients.claim();
// });

// self.addEventListener('fetch', (event) => {
//   event.respondWith(
//     fetch(event.request).catch(() => {
//       return caches.match(event.request);
//     })
//   );
// });


const CACHE_NAME = 'habit-tracker-v1';
const APP_SHELL = [
  '/',
  '/login',
  '/signup',
  '/dashboard',
  '/manifest.json'
];

// Install: cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch: network first, fallback to cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        return res;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});