import idb from 'idb';


let staticCacheName = 'mws-restaurant-v01';

const restaurantsDB = idb.open('restaurants', 1, function(upgradeDb) {
  let restaurantStore = upgradeDb.createObjectStore('restaurantStore', { keyPath: 'id' });
});

self.addEventListener('install', function(event) {
  let urlsToCache = [
  '/',
  'index.html',
  'restaurant.html',
  'css/styles.css',
  'js/main.js',
  'js/restaurant_info.js',
  'manifest.json',
  'img/icons/icon-72x72.png',
  'img/icons/icon-96x96.png',
  'img/icons/icon-128x128.png',
  'img/icons/icon-144x144.png',
  'img/icons/icon-152x152.png',
  'img/icons/icon-192x192.png',
  'img/icons/icon-384x384.png',
  'img/icons/icon-512x512.png'
  ];

  event.waitUntil(
    caches.open(staticCacheName).then(function(cache) {
      return cache.addAll(urlsToCache);
    })
  );

});

self.addEventListener('fetch', function(event) {
  let fetchRequest = event.request;

  if (fetchRequest.url.includes('1337')) {

    event.respondWith(
      restaurantsDB.then(function(db) {
        let tx = db.transaction('restaurantStore');
        let store = tx.objectStore('restaurantStore');
        return store.get(-1);
      }).then(function(response) {
        if(response) {
          return response.jsonData;
        }
        else {
          return fetch(fetchRequest)
          .then(function(data) {
            return data.json();
          }).then(function(jsonData) {
            return restaurantsDB.then(function(db) {
              let tx = db.transaction('restaurantStore', 'readwrite');
              let store = tx.objectStore('restaurantStore');
              jsonData.forEach(function(rest) {
                store.put({id: -1, jsonData});
                return tx.complete;
              });
              return jsonData;
            })
          });
        }
      }).then(function(finalResponse) {
        return new Response(JSON.stringify(finalResponse));
      })
    );

  }

  else {

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

  }


});




