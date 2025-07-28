import axios from 'axios';

const API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

const tmdb = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
    language: 'en-US',
  },
});

export const getPopularMovies = async (page = 1) => {
  try {
    const response = await tmdb.get('/movie/popular', {
      params: { page },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    throw error;
  }
};

export const getTopRatedMovies = async (page = 1) => {
  try {
    const response = await tmdb.get('/movie/top_rated', {
      params: { page },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching top rated movies:', error);
    throw error;
  }
};

export const getNowPlayingMovies = async (page = 1) => {
  try {
    const response = await tmdb.get('/movie/now_playing', {
      params: { page },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching now playing movies:', error);
    throw error;
  }
};

export const getMovieDetails = async (movieId) => {
  try {
    const response = await tmdb.get(`/movie/${movieId}`, {
      params: {
        append_to_response: 'credits,videos,recommendations,watch/providers',
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching movie details for ID ${movieId}:`, error);
    throw error;
  }
};

export const searchMovies = async (query, page = 1) => {
  try {
    const response = await tmdb.get('/search/movie', {
      params: {
        query,
        page,
        include_adult: false,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error searching movies:', error);
    throw error;
  }
};

export const getOscarWinners = async () => {
  try {
    // This is a simplified example - you might want to adjust the query
    const response = await tmdb.get('/discover/movie', {
      params: {
        with_awards: true,
        'vote_average.gte': 7.5,
        'vote_count.gte': 1000,
        sort_by: 'vote_average.desc',
        'primary_release_date.lte': '2023-12-31',
        'with_original_language': 'en',
        'with_watch_providers': '8',
        watch_region: 'US',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching Oscar winners:', error);
    throw error;
  }
};

export const getCriticsPicks = async () => {
  try {
    const response = await tmdb.get('/movie/top_rated', {
      params: {
        'vote_count.gte': 100,
        'vote_average.gte': 7.5,
        'with_original_language': 'en',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching critics picks:', error);
    throw error;
  }
};
