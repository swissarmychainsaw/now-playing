import { useState, useCallback } from 'react';
import { saveRating, removeRating } from '../services/ratings';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook to handle movie rating functionality
 * @returns {Object} - Rating functions and state
 */
export const useMovieRating = () => {
  const { user } = useAuth();
  const [isRating, setIsRating] = useState(false);

  /**
   * Rate a movie
   * @param {string} movieId - The ID of the movie to rate
   * @param {number} rating - The rating value (1-5)
   * @param {Object} movieData - Additional movie data to store with the rating
   */
  const rateMovie = useCallback(async (movieId, rating, movieData = {}) => {
    if (!user) {
      toast.error('Please sign in to rate movies');
      return false;
    }

    if (!movieId || !rating) {
      console.error('Missing required parameters for rateMovie');
      return false;
    }

    setIsRating(true);
    try {
      // If rating is 0, remove the rating
      if (rating === 0) {
        await removeRating(user.uid, movieId);
        toast.success('Rating removed');
        return true;
      }

      // Otherwise, save the rating
      await saveRating(user.uid, movieId, rating, {
        ...movieData,
        title: movieData.title || 'Untitled Movie',
        poster_path: movieData.poster_path || null,
        release_date: movieData.release_date || null,
      });

      toast.success(`Rated ${rating} star${rating > 1 ? 's' : ''}`);
      return true;
    } catch (error) {
      console.error('Error rating movie:', error);
      toast.error('Failed to save rating. Please try again.');
      return false;
    } finally {
      setIsRating(false);
    }
  }, [user]);

  /**
   * Toggle a movie's rating between liked (5) and not rated (0)
   * @param {string} movieId - The ID of the movie to toggle
   * @param {Object} movieData - Additional movie data
   * @param {number} currentRating - The current rating (if any)
   */
  const toggleLike = useCallback(async (movieId, movieData = {}, currentRating = 0) => {
    // If already liked, remove the rating
    if (currentRating >= 4) {
      return rateMovie(movieId, 0, movieData);
    }
    // Otherwise, set to 5 stars (liked)
    return rateMovie(movieId, 5, movieData);
  }, [rateMovie]);

  /**
   * Toggle a movie's rating between disliked (1) and not rated (0)
   * @param {string} movieId - The ID of the movie to toggle
   * @param {Object} movieData - Additional movie data
   * @param {number} currentRating - The current rating (if any)
   */
  const toggleDislike = useCallback(async (movieId, movieData = {}, currentRating = 0) => {
    // If already disliked, remove the rating
    if (currentRating > 0 && currentRating <= 2) {
      return rateMovie(movieId, 0, movieData);
    }
    // Otherwise, set to 1 star (disliked)
    return rateMovie(movieId, 1, movieData);
  }, [rateMovie]);

  return {
    rateMovie,
    toggleLike,
    toggleDislike,
    isRating,
  };
};

export default useMovieRating;
