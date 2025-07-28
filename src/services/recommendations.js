import { 
  getPopularMovies, 
  getTopRatedMovies, 
  getNowPlayingMovies,
  getMovieDetails,
  searchMovies
} from './tmdb';

/**
 * Get personalized recommendations based on user's liked movies
 * @param {Array} likedMovies - Array of movie IDs that the user has liked
 * @param {Object} userPreferences - User preferences (to be implemented)
 * @returns {Promise<Array>} - Array of recommended movies
 */
export const getPersonalizedRecommendations = async (likedMovies = [], userPreferences = {}) => {
  try {
    if (likedMovies.length === 0) {
      // If no liked movies, return popular movies as fallback
      const popular = await getPopularMovies();
      return popular.results || [];
    }

    // Get details for all liked movies to extract genres and keywords
    const movieDetailsPromises = likedMovies.map(movieId => 
      getMovieDetails(movieId).catch(() => null)
    );
    
    const moviesDetails = (await Promise.all(movieDetailsPromises))
      .filter(Boolean); // Remove any failed requests

    if (moviesDetails.length === 0) {
      const popular = await getPopularMovies();
      return popular.results || [];
    }

    // Extract unique genres from liked movies
    const allGenres = new Set();
    moviesDetails.forEach(movie => {
      if (movie.genres) {
        movie.genres.forEach(genre => allGenres.add(genre.id));
      }
    });

    // Get movies with similar genres
    const genreQuery = Array.from(allGenres).join('|');
    
    // Get recommendations based on liked movies
    const recommendations = [];
    
    // 1. Get recommendations from TMDb's recommendation endpoint for each liked movie
    const recommendationPromises = moviesDetails.slice(0, 3).map(movie => 
      searchMovies(movie.title, 1)
        .then(data => data.results || [])
        .catch(() => [])
    );
    
    const recommendationsResults = await Promise.all(recommendationPromises);
    recommendationsResults.forEach(movies => {
      recommendations.push(...movies);
    });
    
    // 2. Get top rated movies in the same genres as liked movies
    if (genreQuery) {
      const topRatedInGenre = await getTopRatedMovies();
      if (topRatedInGenre.results) {
        recommendations.push(...topRatedInGenre.results);
      }
    }

    // 3. Add some now playing movies for variety
    const nowPlaying = await getNowPlayingMovies();
    if (nowPlaying.results) {
      recommendations.push(...nowPlaying.results);
    }

    // Remove duplicates and filter out already liked movies
    const uniqueRecommendations = [];
    const seenIds = new Set(likedMovies);
    
    for (const movie of recommendations) {
      if (!seenIds.has(movie.id.toString()) && movie.poster_path) {
        seenIds.add(movie.id.toString());
        uniqueRecommendations.push(movie);
      }
    }

    // Sort by popularity (or another metric) and limit to 20 movies
    return uniqueRecommendations
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 20);
      
  } catch (error) {
    console.error('Error generating recommendations:', error);
    // Fallback to popular movies if there's an error
    const popular = await getPopularMovies();
    return popular.results || [];
  }
};

/**
 * Get recommendations for the "For You" tab
 * @param {Array} likedMovies - Array of movie IDs that the user has liked
 * @param {Array} dislikedMovies - Array of movie IDs that the user has disliked
 * @returns {Promise<Array>} - Array of recommended movies
 */
export const getForYouRecommendations = async (likedMovies = [], dislikedMovies = []) => {
  try {
    // Get personalized recommendations based on liked movies
    const recommendations = await getPersonalizedRecommendations(likedMovies);
    
    // Filter out disliked movies
    const dislikedIds = new Set(dislikedMovies.map(id => id.toString()));
    return recommendations.filter(movie => !dislikedIds.has(movie.id.toString()));
    
  } catch (error) {
    console.error('Error getting "For You" recommendations:', error);
    const popular = await getPopularMovies();
    return popular.results || [];
  }
};

/**
 * Get recommendations for the "Oscar Winners" tab
 * @returns {Promise<Array>} - Array of Oscar-winning movies
 */
export const getOscarWinners = async () => {
  try {
    // This is a simplified implementation
    // In a real app, you might want to use a more sophisticated method
    // to identify Oscar winners
    const response = await searchMovies('Oscar winner', 1);
    return response.results || [];
  } catch (error) {
    console.error('Error getting Oscar winners:', error);
    return [];
  }
};

/**
 * Get recommendations for the "Critics' Picks" tab
 * @returns {Promise<Array>} - Array of critic-favored movies
 */
export const getCriticsPicks = async () => {
  try {
    // Get top rated movies with high vote counts
    const response = await searchMovies('', 1, {
      'vote_average.gte': 7.5,
      'vote_count.gte': 1000,
      sort_by: 'vote_average.desc'
    });
    return response.results || [];
  } catch (error) {
    console.error('Error getting critics\' picks:', error);
    return [];
  }
};
