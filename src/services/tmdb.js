import axios from 'axios';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

const tmdbApi = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
    language: 'en-US'
  }
});

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

export default {
  getDirectorDetails,
  getDirectorMovies,
  getMovieCredits
};
