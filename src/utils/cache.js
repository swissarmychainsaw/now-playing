/**
 * A simple in-memory cache with TTL (time to live) support
 */
class Cache {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Set a value in the cache
   * @param {string} key - The cache key
   * @param {any} value - The value to cache
   * @param {number} ttl - Time to live in milliseconds
   */
  set(key, value, ttl = 5 * 60 * 1000) {
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttl,
    });
  }

  /**
   * Get a value from the cache
   * @param {string} key - The cache key
   * @returns {any|null} The cached value or null if not found/expired
   */
  get(key) {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    // Check if the item has expired
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  /**
   * Delete a value from the cache
   * @param {string} key - The cache key to delete
   */
  delete(key) {
    this.cache.delete(key);
  }

  /**
   * Clear all expired items from the cache
   */
  cleanup() {
    const now = Date.now();
    for (const [key, { expiry }] of this.cache.entries()) {
      if (now > expiry) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear the entire cache
   */
  clear() {
    this.cache.clear();
  }
}

// Create a singleton instance
export const apiCache = new Cache();

// Run cleanup every 5 minutes to remove expired items
setInterval(() => {
  apiCache.cleanup();
}, 5 * 60 * 1000);

export default apiCache;
