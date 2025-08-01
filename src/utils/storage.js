/**
 * A utility class for handling localStorage operations with type safety and error handling
 */
class Storage {
  /**
   * Get an item from localStorage
   * @param {string} key - The key to retrieve
   * @param {any} defaultValue - The default value to return if the key doesn't exist
   * @returns {any} The parsed value or the default value
   */
  static get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error getting item from localStorage (${key}):`, error);
      return defaultValue;
    }
  }

  /**
   * Set an item in localStorage
   * @param {string} key - The key to set
   * @param {any} value - The value to store (will be stringified)
   * @returns {boolean} True if successful, false otherwise
   */
  static set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting item in localStorage (${key}):`, error);
      return false;
    }
  }

  /**
   * Remove an item from localStorage
   * @param {string} key - The key to remove
   * @returns {boolean} True if successful, false otherwise
   */
  static remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing item from localStorage (${key}):`, error);
      return false;
    }
  }

  /**
   * Clear all items from localStorage
   * @returns {boolean} True if successful, false otherwise
   */
  static clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }

  /**
   * Check if a key exists in localStorage
   * @param {string} key - The key to check
   * @returns {boolean} True if the key exists, false otherwise
   */
  static has(key) {
    try {
      return localStorage.getItem(key) !== null;
    } catch (error) {
      console.error(`Error checking for key in localStorage (${key}):`, error);
      return false;
    }
  }

  // Movie-specific storage helpers

  /**
   * Get the user's favorite movies
   * @returns {Array<number>} Array of movie IDs
   */
  static getFavorites() {
    return this.get('favoriteMovies', []);
  }

  /**
   * Add a movie to favorites
   * @param {number} movieId - The ID of the movie to add
   * @returns {boolean} True if successful, false otherwise
   */
  static addFavorite(movieId) {
    const favorites = this.getFavorites();
    if (!favorites.includes(movieId)) {
      favorites.push(movieId);
      return this.set('favoriteMovies', favorites);
    }
    return true; // Already in favorites
  }

  /**
   * Remove a movie from favorites
   * @param {number} movieId - The ID of the movie to remove
   * @returns {boolean} True if successful, false otherwise
   */
  static removeFavorite(movieId) {
    const favorites = this.getFavorites();
    const index = favorites.indexOf(movieId);
    if (index > -1) {
      favorites.splice(index, 1);
      return this.set('favoriteMovies', favorites);
    }
    return true; // Not in favorites
  }

  /**
   * Check if a movie is in favorites
   * @param {number} movieId - The ID of the movie to check
   * @returns {boolean} True if the movie is in favorites, false otherwise
   */
  static isFavorite(movieId) {
    const favorites = this.getFavorites();
    return favorites.includes(movieId);
  }

  /**
   * Get the user's watchlist
   * @returns {Array<number>} Array of movie IDs
   */
  static getWatchlist() {
    return this.get('watchlist', []);
  }

  /**
   * Add a movie to the watchlist
   * @param {number} movieId - The ID of the movie to add
   * @returns {boolean} True if successful, false otherwise
   */
  static addToWatchlist(movieId) {
    const watchlist = this.getWatchlist();
    if (!watchlist.includes(movieId)) {
      watchlist.push(movieId);
      return this.set('watchlist', watchlist);
    }
    return true; // Already in watchlist
  }

  /**
   * Remove a movie from the watchlist
   * @param {number} movieId - The ID of the movie to remove
   * @returns {boolean} True if successful, false otherwise
   */
  static removeFromWatchlist(movieId) {
    const watchlist = this.getWatchlist();
    const index = watchlist.indexOf(movieId);
    if (index > -1) {
      watchlist.splice(index, 1);
      return this.set('watchlist', watchlist);
    }
    return true; // Not in watchlist
  }

  /**
   * Check if a movie is in the watchlist
   * @param {number} movieId - The ID of the movie to check
   * @returns {boolean} True if the movie is in the watchlist, false otherwise
   */
  static isInWatchlist(movieId) {
    const watchlist = this.getWatchlist();
    return watchlist.includes(movieId);
  }

  /**
   * Get the user's watched movies
   * @returns {Array<{id: number, date: string}>} Array of watched movie objects with IDs and dates
   */
  static getWatched() {
    return this.get('watchedMovies', []);
  }

  /**
   * Add a movie to watched list
   * @param {number} movieId - The ID of the movie to add
   * @returns {boolean} True if successful, false otherwise
   */
  static addToWatched(movieId) {
    const watched = this.getWatched();
    const existingIndex = watched.findIndex(item => item.id === movieId);
    
    if (existingIndex > -1) {
      // Update the date if already watched
      watched[existingIndex] = { id: movieId, date: new Date().toISOString() };
    } else {
      // Add new watched movie
      watched.push({ id: movieId, date: new Date().toISOString() });
    }
    
    return this.set('watchedMovies', watched);
  }

  /**
   * Remove a movie from watched list
   * @param {number} movieId - The ID of the movie to remove
   * @returns {boolean} True if successful, false otherwise
   */
  static removeFromWatched(movieId) {
    const watched = this.getWatched();
    const filtered = watched.filter(item => item.id !== movieId);
    
    if (filtered.length !== watched.length) {
      return this.set('watchedMovies', filtered);
    }
    
    return true; // Not in watched list
  }

  /**
   * Check if a movie is in the watched list
   * @param {number} movieId - The ID of the movie to check
   * @returns {boolean} True if the movie is in the watched list, false otherwise
   */
  static isWatched(movieId) {
    const watched = this.getWatched();
    return watched.some(item => item.id === movieId);
  }

  /**
   * Get the user's movie ratings
   * @returns {Object} Object with movie IDs as keys and ratings as values (1-10)
   */
  static getRatings() {
    return this.get('movieRatings', {});
  }

  /**
   * Rate a movie
   * @param {number} movieId - The ID of the movie to rate
   * @param {number} rating - The rating (1-10)
   * @returns {boolean} True if successful, false otherwise
   */
  static rateMovie(movieId, rating) {
    if (rating < 1 || rating > 10) {
      console.error('Rating must be between 1 and 10');
      return false;
    }
    
    const ratings = this.getRatings();
    ratings[movieId] = rating;
    return this.set('movieRatings', ratings);
  }

  /**
   * Get a movie's rating
   * @param {number} movieId - The ID of the movie
   * @returns {number|null} The rating (1-10) or null if not rated
   */
  static getMovieRating(movieId) {
    const ratings = this.getRatings();
    return ratings[movieId] || null;
  }

  /**
   * Remove a movie rating
   * @param {number} movieId - The ID of the movie
   * @returns {boolean} True if successful, false otherwise
   */
  static removeRating(movieId) {
    const ratings = this.getRatings();
    if (ratings.hasOwnProperty(movieId)) {
      delete ratings[movieId];
      return this.set('movieRatings', ratings);
    }
    return true; // No rating to remove
  }
}

export default Storage;
