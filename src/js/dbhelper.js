import idb from 'idb';

/**
 * Common database helper functions.
 */
export default class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337; // Change this to your server port
    return `http://localhost:${port}`;
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', `${DBHelper.DATABASE_URL}/restaurants`);
    xhr.onload = () => {
      if (xhr.status === 200) { // Got a success response from server!
        const json = JSON.parse(xhr.responseText);
        const restaurants = json;
        callback(null, restaurants);
      } else { // Oops!. Got an error from server.
        const error = (`Request failed. Returned status of ${xhr.status}`);
        callback(error, null);
      }
    };
    xhr.send();
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }

  static fetchReviewsByRestaurantId(id, callback) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', `${DBHelper.DATABASE_URL}/reviews/?restaurant_id=${id}`);
    xhr.onload = () => {
      if (xhr.status === 200) { // Got a success response from server!
        const json = JSON.parse(xhr.responseText);
        callback(json);
      } else { // Oops!. Got an error from server.
        const error = (`Request failed. Returned status of ${xhr.status}`);
        console.log(error);
      }
    };
    xhr.send();
  }

  static createFavoriteButton(restaurant) {
    const favorite = document.createElement('button');
    favorite.className = 'fav';
    favorite.id = restaurant.id;
    favorite.innerHTML = 'Favorite';
    favorite.setAttribute('aria-label', `Mark ${restaurant.name} as a favorite`);
    favorite.setAttribute('aria-pressed', restaurant.is_favorite);
    favorite.onclick = DBHelper.markAsFavorite;
    return favorite;
  }

  static markAsFavorite(event) {
  let button = event.target;
  let restID = button.id;
  let isFav = button.getAttribute('aria-pressed') === 'true';

  fetch(`${DBHelper.DATABASE_URL}/restaurants/${restID}/?is_favorite=${!isFav}`, {method: 'PUT'})
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      else {
        return Promise.reject('Not able to add as a favorite');
      }
    }).then(json => {
      button.setAttribute('aria-pressed', !isFav);
      const restObj = json;
      DBHelper.updateRestaurantDB(restObj);
    });
}

static updateRestaurantDB(restObj) {
  const restaurantsDB = idb.open('restaurants');
  restaurantsDB.then(function(db) {
    let tx = db.transaction('restaurantStore', 'readwrite');
    let store = tx.objectStore('restaurantStore');
    store.put(restObj);
    return tx.complete;
  });

}

static getFormData(id) {
  const nameInput = document.getElementById('name');
  const ratingInput = document.getElementById('rating');
  const commentInput = document.getElementById('comment');
  const properties = {
      "restaurant_id": id,
      "name": nameInput.value,
      "rating": ratingInput.value,
      "comments": commentInput.value
    };

  fetch(`${DBHelper.DATABASE_URL}/reviews/`, {
    method: 'POST',
    body: JSON.stringify(properties)
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      else {
        return Promise.reject('Not able to add review');
      }
    });

    nameInput.value = '';
    ratingInput.value = '';
    commentInput.value = '';
}

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/images/${restaurant.photograph}`);
  }

  /**
   * Map marker for a restaurant.
   */
   static mapMarkerForRestaurant(restaurant, map) {
    // https://leafletjs.com/reference-1.3.0.html#marker
    const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
      {title: restaurant.name,
      alt: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant)
      })
      marker.addTo(map);
    return marker;
  }
  /* static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  } */

}

