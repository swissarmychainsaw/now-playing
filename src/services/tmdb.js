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
    // Skip logging for canceled requests
    if (axios.isCancel(error) || error.code === 'ERR_CANCELED' || error.name === 'AbortError') {
      return Promise.reject(error);
    }
    
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

/**
 * Get watch providers for a specific movie
 * @param {number} movieId - The ID of the movie
 * @returns {Promise<Object>} - Watch providers information
 */
async function getMovieWatchProviders(movieId) {
  try {
    const response = await tmdbApi.get(`/movie/${movieId}/watch/providers`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching watch providers for movie ${movieId}:`, error);
    throw error;
  }
}

/**
 * Get videos (trailers, teasers, etc.) for a specific movie
 * @param {number} movieId - The ID of the movie
 * @returns {Promise<Object>} - Videos information
 */
async function getMovieVideos(movieId) {
  try {
    const response = await tmdbApi.get(`/movie/${movieId}/videos`, {
      params: {
        language: 'en-US',
        include_video_language: 'en',
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching videos for movie ${movieId}:`, error);
    throw error;
  }
}

/**
 * Fallback to OMDB API when TMDB fails
 * @param {string} title - The title of the show/movie
 * @param {number} year - The release year (optional)
 * @returns {Promise<Object>} - Fallback data from OMDB
 */
const fetchFromOmdb = async (title, year) => {
  try {
    const apiKey = import.meta.env.VITE_OMDB_API_KEY;
    if (!apiKey) {
      console.warn('OMDB API key not found. Please set VITE_OMDB_API_KEY in your environment variables.');
      return null;
    }

    const response = await axios.get('http://www.omdbapi.com/', {
      params: {
        apikey: apiKey,
        t: title,
        y: year,
        type: 'series',
        plot: 'full'
      },
      timeout: 5000 // 5 second timeout
    });

    if (response.data && response.data.Response === 'True') {
      return {
        title: response.data.Title,
        overview: response.data.Plot,
        poster_path: response.data.Poster.startsWith('http') ? response.data.Poster : null,
        release_date: response.data.Year,
        vote_average: response.data.imdbRating ? parseFloat(response.data.imdbRating) * 10 : 0,
        credits: {
          cast: response.data.Actors ? response.data.Actors.split(', ').map(actor => ({
            name: actor,
            character: 'Actor'
          })) : [],
          crew: response.data.Director ? [{
            name: response.data.Director,
            job: 'Director'
          }] : []
        },
        videos: {
          results: response.data.imdbID ? [{
            key: response.data.imdbID,
            site: 'imdb',
            type: 'Trailer',
            name: `${response.data.Title} (${response.data.Year})`
          }] : []
        },
        providers: {},
        media_type: 'tv',
        external_ids: {
          imdb_id: response.data.imdbID
        }
      };
    }
    return null;
  } catch (error) {
    console.warn('Error fetching from OMDB:', error.message);
    return null;
  }
};

/**
 * Get detailed information about a TV show
 * @param {number} tvId - The ID of the TV show
 * @param {string} title - The title of the TV show
 * @param {number} year - The release year of the TV show
 * @returns {Promise<Object>} - Detailed TV show information
 */
export const getTvDetails = async (tvId, title = '', year = null) => {
  try {
    const response = await tmdbApi.get(`/tv/${tvId}`, {
      params: {
        append_to_response: 'credits,keywords,recommendations,similar,content_ratings'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching TV show details from TMDB, trying fallback...', error.message);
    
    // Only try OMDB fallback if we have a title
    if (title) {
      const fallbackData = await fetchFromOmdb(title, year);
      if (fallbackData) {
        console.log('Using fallback data from OMDB');
        return fallbackData;
      }
    }
    
    throw error; // Re-throw if all fallbacks fail
  }
};

/**
 * Get credits for a TV show
 * @param {number} tvId - The ID of the TV show
 * @returns {Promise<Object>} - Credits information
 */
export const getTvCredits = async (tvId) => {
  try {
    const response = await tmdbApi.get(`/tv/${tvId}/credits`);
    return response.data;
  } catch (error) {
    console.warn('Error fetching TV credits:', error.message);
    // Return empty credits if the API call fails
    return { cast: [], crew: [] };
  }
};

/**
 * Get watch providers for a TV show
 * @param {number} tvId - The ID of the TV show
 * @returns {Promise<Object>} - Watch providers information
 */
export const getTvWatchProviders = async (tvId) => {
  try {
    const response = await tmdbApi.get(`/tv/${tvId}/watch/providers`);
    return response.data.results?.US || {};
  } catch (error) {
    console.warn('Error fetching TV providers:', error.message);
    return {};
  }
};

/**
 * Get videos for a TV show
 * @param {number} tvId - The ID of the TV show
 * @returns {Promise<Object>} - Videos information
 */
export const getTvVideos = async (tvId) => {
  try {
    const response = await tmdbApi.get(`/tv/${tvId}/videos`);
    return response.data;
  } catch (error) {
    console.warn('Error fetching TV videos:', error.message);
    return { results: [] };
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
  getConfiguration,
  getMovieWatchProviders,
  getMovieVideos,
  getTvDetails,
  getTvCredits,
  getTvWatchProviders,
  getTvVideos
};

export default tmdbService;

// Recommendation methods
tmdbService.getMovieRecommendations = async function(movieId, options = {}) {
  try {
    const response = await tmdbApi.get(`/movie/${movieId}/recommendations`, {
      params: {
        language: 'en-US',
        page: 1,
        ...options
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching movie recommendations:', error);
    throw error;
  }
};

tmdbService.getPopularMovies = async function(options = {}) {
  try {
    const response = await tmdbApi.get('/movie/popular', {
      params: {
        language: 'en-US',
        page: 1,
        ...options
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    throw error;
  }
};
