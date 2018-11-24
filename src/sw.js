import idb from 'idb';


let staticCacheName = 'mws-restaurant-v01';

const restaurantsDB = idb.open('restaurants', 3, function(upgradeDb) {
  switch (upgradeDb.oldVersion) {
    case 0:
      upgradeDb.createObjectStore('restaurantStore', { keyPath: 'id' });
    case 1:
      let reviewStore = upgradeDb.createObjectStore('reviewStore', { keyPath: 'id' });
      reviewStore.createIndex('restID', 'restaurant_id');
    case 2:
      let pendingStore = upgradeDb.createObjectStore('pendingStore', {autoIncrement: true});
      pendingStore.createIndex('restID', 'restaurant_id');
  }
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

  if (fetchRequest.url.includes('?is_favorite')) {
    return fetch(fetchRequest)
    .then(function(data) {
      return data.json();
    })
  }
  else if (fetchRequest.url.includes('1337/restaurants')) {

    event.respondWith(
      restaurantsDB.then(function(db) {
        let tx = db.transaction('restaurantStore');
        let store = tx.objectStore('restaurantStore');
        return store.getAll();
      }).then(function(response) {
        if(response.length !== 0) {
          return response;
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
                store.put(rest);
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
  else if (fetchRequest.url.includes('1337/reviews/?restaurant_id')) {

    event.respondWith(
      restaurantsDB.then(function(db) {
        let tx = db.transaction('reviewStore');
        let revStore = tx.objectStore('reviewStore');
        let revIndex = revStore.index('restID');
        let id = fetchRequest.url.slice(-1);
        return revIndex.getAll(parseInt(id));
      }).then(function(response) {
        if(response.length !== 0) {
          return response;
        }
        else {
          return fetch(fetchRequest)
          .then(function(data) {
            return data.json();
          }).then(function(jsonData) {
            return restaurantsDB.then(function(db) {
              let tx = db.transaction('reviewStore', 'readwrite');
              let store = tx.objectStore('reviewStore');
              jsonData.forEach(function(rev) {
                store.put(rev);
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
  else if (fetchRequest.url.includes('restaurant.html')) {

    let cacheRequest = new Request('restaurant.html');

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




