var CACHE_NAME = 'edinburgh-parks';

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('[Service Worker] Opened cache');
        return cache.addAll([
          'index.html',
          'index.js',
          'data.json',
          'app.css',
          'img/park.svg'
        ]);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.match(event.request).then(function(response) {
        var fetchPromise = fetch(event.request)
          .then(function(networkResponse) {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          })
          .catch(err => {
              console.log('[Service Worker] Can\'t update cache from network');
          });
          return response || fetchPromise;
        })
    })
  );
});
