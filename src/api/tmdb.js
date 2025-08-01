import { apiCache } from '../utils/cache';

const BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

if (!API_KEY) {
  console.error('TMDB API key is not configured. Please set VITE_TMDB_API_KEY in your environment variables.');
}

/**
 * Makes a request to the TMDB API with caching support
 * @param {string} endpoint - The API endpoint (e.g., '/movie/popular')
 * @param {Object} params - Query parameters for the request
 * @param {string} method - HTTP method (default: 'GET')
 * @param {Object} body - Request body for POST/PUT requests
 * @param {number} cacheDuration - Cache duration in milliseconds (default: 5 minutes)
 * @returns {Promise<Object>} The parsed JSON response
 */
const tmdbRequest = async (endpoint, params = {}, method = 'GET', body = null, cacheDuration = 5 * 60 * 1000) => {
  // Create cache key based on endpoint and params
  const cacheKey = `${endpoint}?${new URLSearchParams(params).toString()}`;
  
  // Check cache first
  if (method === 'GET') {
    const cachedData = apiCache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }
  }

  // Build URL with API key
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.append('api_key', API_KEY);
  
  // Add query parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, value);
    }
  });

  // Prepare request options
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  };

  // Add body for POST/PUT requests
  if (body && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url.toString(), options);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.status_message || `API request failed with status ${response.status}`);
      error.status = response.status;
      error.status_code = errorData.status_code;
      throw error;
    }

    const data = await response.json();
    
    // Cache the response if it's a GET request
    if (method === 'GET' && cacheDuration > 0) {
      apiCache.set(cacheKey, data, cacheDuration);
    }
    
    return data;
  } catch (error) {
    console.error(`TMDB API Error (${endpoint}):`, error);
    throw error;
  }
};

// Movie endpoints
export const movies = {
  /**
   * Get details of a specific movie
   * @param {number} movieId - The TMDB movie ID
   * @param {Object} options - Additional options
   * @param {string} options.appendToResponse - Comma-separated list of additional data to include
   * @returns {Promise<Object>} Movie details
   */
  getDetails: (movieId, { appendToResponse = '' } = {}) => {
    return tmdbRequest(
      `/movie/${movieId}`,
      { append_to_response: appendToResponse },
      'GET',
      null,
      30 * 60 * 1000 // 30 minutes cache
    );
  },

  /**
   * Search for movies
   * @param {string} query - The search query
   * @param {Object} options - Search options
   * @param {number} options.page - Page number (default: 1)
   * @param {boolean} options.includeAdult - Include adult content (default: false)
   * @returns {Promise<Object>} Search results
   */
  search: (query, { page = 1, includeAdult = false } = {}) => {
    return tmdbRequest(
      '/search/movie',
      { 
        query,
        page,
        include_adult: includeAdult,
      },
      'GET',
      null,
      5 * 60 * 1000 // 5 minutes cache
    );
  },

  /**
   * Get popular movies
   * @param {Object} options - Options
   * @param {number} options.page - Page number (default: 1)
   * @returns {Promise<Object>} Popular movies
   */
  getPopular: ({ page = 1 } = {}) => {
    return tmdbRequest(
      '/movie/popular',
      { page },
      'GET',
      null,
      60 * 60 * 1000 // 1 hour cache
    );
  },

  /**
   * Get top rated movies
   * @param {Object} options - Options
   * @param {number} options.page - Page number (default: 1)
   * @returns {Promise<Object>} Top rated movies
   */
  getTopRated: ({ page = 1 } = {}) => {
    return tmdbRequest(
      '/movie/top_rated',
      { page },
      'GET',
      null,
      24 * 60 * 60 * 1000 // 24 hours cache
    );
  },

  /**
   * Get upcoming movies
   * @param {Object} options - Options
   * @param {number} options.page - Page number (default: 1)
   * @returns {Promise<Object>} Upcoming movies
   */
  getUpcoming: ({ page = 1 } = {}) => {
    return tmdbRequest(
      '/movie/upcoming',
      { page },
      'GET',
      null,
      6 * 60 * 60 * 1000 // 6 hours cache
    );
  },

  /**
   * Get movie credits
   * @param {number} movieId - The TMDB movie ID
   * @returns {Promise<Object>} Movie credits
   */
  getCredits: (movieId) => {
    return tmdbRequest(
      `/movie/${movieId}/credits`,
      {},
      'GET',
      null,
      30 * 60 * 1000 // 30 minutes cache
    );
  },

  /**
   * Get similar movies
   * @param {number} movieId - The TMDB movie ID
   * @param {Object} options - Options
   * @param {number} options.page - Page number (default: 1)
   * @returns {Promise<Object>} Similar movies
   */
  getSimilar: (movieId, { page = 1 } = {}) => {
    return tmdbRequest(
      `/movie/${movieId}/similar`,
      { page },
      'GET',
      null,
      30 * 60 * 1000 // 30 minutes cache
    );
  },

  /**
   * Get movie recommendations
   * @param {number} movieId - The TMDB movie ID
   * @param {Object} options - Options
   * @param {number} options.page - Page number (default: 1)
   * @returns {Promise<Object>} Movie recommendations
   */
  getRecommendations: (movieId, { page = 1 } = {}) => {
    return tmdbRequest(
      `/movie/${movieId}/recommendations`,
      { page },
      'GET',
      null,
      30 * 60 * 1000 // 30 minutes cache
    );
  },

  /**
   * Get movie videos (trailers, teasers, etc.)
   * @param {number} movieId - The TMDB movie ID
   * @returns {Promise<Object>} Movie videos
   */
  getVideos: (movieId) => {
    return tmdbRequest(
      `/movie/${movieId}/videos`,
      {},
      'GET',
      null,
      24 * 60 * 60 * 1000 // 24 hours cache
    );
  },

  /**
   * Get movie watch providers
   * @param {number} movieId - The TMDB movie ID
   * @returns {Promise<Object>} Watch providers
   */
  getWatchProviders: (movieId) => {
    return tmdbRequest(
      `/movie/${movieId}/watch/providers`,
      {},
      'GET',
      null,
      12 * 60 * 60 * 1000 // 12 hours cache
    );
  },
};

// Genre endpoints
export const genres = {
  /**
   * Get the list of official genres for movies
   * @returns {Promise<Object>} List of genres
   */
  getMovieList: () => {
    return tmdbRequest(
      '/genre/movie/list',
      {},
      'GET',
      null,
      7 * 24 * 60 * 60 * 1000 // 1 week cache
    );
  },
};

// Search endpoints
export const search = {
  /**
   * Search for movies, TV shows, and people
   * @param {string} query - The search query
   * @param {Object} options - Search options
   * @param {number} options.page - Page number (default: 1)
   * @param {boolean} options.includeAdult - Include adult content (default: false)
   * @returns {Promise<Object>} Search results
   */
  multi: (query, { page = 1, includeAdult = false } = {}) => {
    return tmdbRequest(
      '/search/multi',
      {
        query,
        page,
        include_adult: includeAdult,
      },
      'GET',
      null,
      5 * 60 * 1000 // 5 minutes cache
    );
  },
};

export default {
  movies,
  genres,
  search,
  request: tmdbRequest,
};
