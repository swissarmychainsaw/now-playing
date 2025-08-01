import axios from 'axios';

const BASE_URL = 'https://api.themoviedb.org/3';

// Create axios instance with base configuration
const tmdbApi = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: import.meta.env.VITE_TMDB_API_KEY,
    language: 'en-US'
  },
  timeout: 10000 // 10 second timeout
});

// Request interceptor for logging
let requestCount = 0;
tmdbApi.interceptors.request.use(config => {
  const requestId = ++requestCount;
  console.log(`[TMDB Request ${requestId}]`, {
    url: config.url,
    method: config.method,
    params: config.params,
    hasData: !!config.data
  });
  
  // Add request start time to measure duration
  config.metadata = { startTime: Date.now(), requestId };
  return config;
});

// Response interceptor for logging
tmdbApi.interceptors.response.use(
  response => {
    const { config, status, statusText } = response;
    const duration = Date.now() - config.metadata.startTime;
    console.log(`[TMDB Response ${config.metadata.requestId}]`, {
      status,
      statusText,
      duration: `${duration}ms`,
      url: config.url,
      data: response.data?.results ? 
        `${response.data.results.length} results` : 
        'No results array'
    });
    return response;
  },
  error => {
    if (error.config) {
      const duration = Date.now() - error.config.metadata.startTime;
      console.error(`[TMDB Error ${error.config.metadata.requestId}]`, {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        duration: `${duration}ms`,
        url: error.config.url,
        method: error.config.method
      });
    } else {
      console.error('TMDB Error (no config):', error);
    }
    return Promise.reject(error);
  }
);

/**
 * Get detailed information about a specific movie
 * @param {number} movieId - The ID of the movie
 * @returns {Promise<Object>} - Detailed movie information
 */
export const getMovieDetails = async (movieId) => {
  try {
    const response = await tmdbApi.get(`/movie/${movieId}`, {
      params: {
        append_to_response: 'credits,keywords,recommendations,similar'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching movie details:', error);
    throw error;
  }
};

/**
 * Get director details by ID
 * @param {number} directorId - The ID of the director
 * @returns {Promise<Object>} - Director details
 */
export const getDirectorDetails = async (directorId) => {
  try {
    const response = await tmdbApi.get(`/person/${directorId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching director details:', error);
    throw error;
  }
};

/**
 * Get movies directed by a specific director
 * @param {number} directorId - The ID of the director
 * @returns {Promise<Object>} - Object containing movies directed by the director
 */
export const getDirectorMovies = async (directorId) => {
  try {
    const response = await tmdbApi.get(`/person/${directorId}/movie_credits`);
    // Filter to only include movies where the person was a director
    const directedMovies = response.data.crew.filter(
      (credit) => credit.job === 'Director' || credit.department === 'Directing'
    );
    return {
      ...response.data,
      cast: directedMovies
    };
  } catch (error) {
    console.error('Error fetching director movies:', error);
    throw error;
  }
};

/**
 * Get movie credits including director information
 * @param {number} movieId - The ID of the movie
 * @returns {Promise<Object>} - Movie credits including director
 */
export const getMovieCredits = async (movieId) => {
  try {
    const response = await tmdbApi.get(`/movie/${movieId}/credits`);
    const director = response.data.crew.find(
      (member) => member.job === 'Director' || member.department === 'Directing'
    );
    return {
      ...response.data,
      director
    };
  } catch (error) {
    console.error('Error fetching movie credits:', error);
    throw error;
  }
};

/**
 * Get movies similar to a specific movie
 * @param {number} movieId - The ID of the movie
 * @param {Object} options - Additional options
 * @param {number} [options.page=1] - Page number
 * @returns {Promise<Object>} - Similar movies
 */
export const getSimilarMovies = async (movieId, { page = 1 } = {}) => {
  try {
    const response = await tmdbApi.get(`/movie/${movieId}/similar`, {
      params: {
        page,
        language: 'en-US'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching similar movies:', error);
    throw error;
  }
};

/**
 * Get movie recommendations based on a specific movie
 * @param {number} movieId - The ID of the movie
 * @param {Object} options - Additional options
 * @param {number} [options.page=1] - Page number
 * @returns {Promise<Object>} - Recommended movies
 */
export const getRecommendations = async (movieId, { page = 1 } = {}) => {
  try {
    const response = await tmdbApi.get(`/movie/${movieId}/recommendations`, {
      params: {
        page,
        language: 'en-US'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching movie recommendations:', error);
    throw error;
  }
};

/**
 * Search for movies by query
 * @param {string} query - The search query
 * @param {Object} options - Additional options
 * @param {number} [options.page=1] - Page number
 * @param {string} [options.language='en-US'] - Language code
 * @param {boolean} [options.includeAdult=false] - Include adult content
 * @param {AbortSignal} [options.signal] - Abort signal for cancelling the request
 * @returns {Promise<Object>} - Search results
 */
const searchMovies = async (query, { 
  page = 1, 
  language = 'en-US',
  includeAdult = false,
  signal
} = {}) => {
  console.log('[searchMovies] Starting search with query:', { query, page, language, includeAdult });
  try {
    console.log('[searchMovies] Making API request to TMDB');
    const response = await tmdbApi.get('/search/movie', {
      params: {
        query,
        page,
        language,
        include_adult: includeAdult
      },
      signal
    });
    console.log('[searchMovies] Received response from TMDB:', {
      status: response.status,
      resultsCount: response.data?.results?.length || 0
    });
    return response.data;
  } catch (error) {
    // Don't log aborted requests
    if (axios.isCancel(error) || error.code === 'ERR_CANCELED') {
      throw error;
    }
    
    // Create a more descriptive error
    let errorMessage = 'Failed to search movies';
    
    if (error.response) {
      // The request was made and the server responded with a status code
      errorMessage = error.response.data?.status_message || 
                   `Request failed with status ${error.response.status}`;
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = 'No response received from the server';
    } else {
      // Something happened in setting up the request
      errorMessage = error.message || 'Error setting up the request';
    }
    
    const apiError = new Error(errorMessage);
    apiError.name = 'TMDB_API_ERROR';
    apiError.code = error.code;
    apiError.status = error.response?.status;
    apiError.response = error.response;
    
    throw apiError;
  }
};

/**
 * Discover movies with advanced filtering
 * @param {Object} params - Search parameters
 * @param {number} [params.page=1] - Page number
 * @param {string} [params.language='en-US'] - Language code
 * @param {boolean} [params.includeAdult=false] - Include adult content
 * @param {string} [params.sortBy='popularity.desc'] - Sort order
 * @param {string} [params.withCast] - Comma separated list of person IDs to filter by cast
 * @param {string} [params.withCrew] - Comma separated list of person IDs to filter by crew
 * @param {string} [params.withGenres] - Comma separated list of genre IDs to filter by
 * @returns {Promise<Object>} - Discovered movies
 */
export const discoverMovies = async ({
  page = 1,
  language = 'en-US',
  includeAdult = false,
  sortBy = 'popularity.desc',
  withCast,
  withCrew,
  withGenres
} = {}) => {
  try {
    const response = await tmdbApi.get('/discover/movie', {
      params: {
        page,
        language,
        include_adult: includeAdult,
        sort_by: sortBy,
        with_cast: withCast,
        with_crew: withCrew,
        with_genres: withGenres
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error discovering movies:', error);
    throw error;
  }
};

/**
 * Get trending movies, TV shows, or people
 * @param {string} mediaType - 'all', 'movie', 'tv', 'person'
 * @param {string} timeWindow - 'day' or 'week'
 * @returns {Promise<Object>} - Trending items
 */
const getTrending = async (mediaType = 'all', timeWindow = 'day') => {
  try {
    const response = await tmdbApi.get(`/trending/${mediaType}/${timeWindow}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching trending items:', error);
    throw error;
  }
};

/**
 * Get movie genres
 * @returns {Promise<Array>} - List of genre objects
 */
const getMovieGenres = async () => {
  try {
    const response = await tmdbApi.get('/genre/movie/list');
    return response.data.genres || [];
  } catch (error) {
    console.error('Error fetching movie genres:', error);
    throw error;
  }
};

/**
 * Get configuration information for images, etc.
 * @returns {Promise<Object>} - Configuration data
 */
const getConfiguration = async () => {
  try {
    const response = await tmdbApi.get('/configuration');
    return response.data;
  } catch (error) {
    console.error('Error fetching configuration:', error);
    throw error;
  }
};

// Export all functions as a single default export
const tmdbService = {
  getMovieDetails,
  getDirectorDetails,
  getDirectorMovies,
  getMovieCredits,
  getSimilarMovies,
  getRecommendations,
  searchMovies,
  discoverMovies,
  getTrending,
  getMovieGenres,
  getConfiguration
};

export default tmdbService;
