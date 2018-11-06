
let staticCacheName = 'mws-restaurant-v01';

self.addEventListener('install', function(event) {
  let urlsToCache = [
  '/',
  'index.html',
  'restaurant.html',
  'css/styles.css',
  'js/main.js',
  'js/restaurant_info.js'
  ];

  event.waitUntil(
    caches.open(staticCacheName).then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );

});

self.addEventListener('fetch', function(event) {
  let cacheRequest = event.request;
  if (cacheRequest.url.includes('restaurant.html')) {
    cacheRequest = new Request('restaurant.html');
  }

  event.respondWith(
    caches.match(cacheRequest).then(function(response) {
      if(response)
        return response;
      else
        return fetch(cacheRequest);
    })
  );
});



